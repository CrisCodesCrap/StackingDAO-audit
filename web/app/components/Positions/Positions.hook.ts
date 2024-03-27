import { useEffect, useState } from 'react';
import {
  callReadOnlyFunction,
  contractPrincipalCV,
  standardPrincipalCV,
  uintCV,
  cvToJSON,
  ClarityType,
  cvToValue,
} from '@stacks/transactions';
import { IntegerType } from '@stacks/common';
import { useAppContext } from '../AppContext/AppContext';
import { stacksNetwork, coreApiUrl } from '../../common/utils';

interface PositionsData {
  stStxBalance: number;
  stxBalance: number;
  stackingApy: number;
  currentCycleId: number;
  zestProvision: number;
  genesisNfts: IGenesisNFTData[];
  unstackNfts: IUnstackNFTData[];
  bitflowBalance: BitflowBalance;
  velarBalance: VelarBalance;
  arkadikoBalance: ArkadikoBalance;
}

interface BitflowBalance {
  lpWallet: number;
  lpStaked: number;
  lpWallet2: number;
  lpStaked2: number;
}

interface VelarBalance {
  lpWallet: number;
  lpStaked: number;
}

interface ArkadikoBalance {
  vault: number;
}

interface IUnstackNFTData {
  id: IntegerType;
  'cycle-id': number;
  'ststx-amount': number;
  'stx-amount': number;
}

interface IGenesisNFTData {
  id: IntegerType;
  type: number;
  name: string;
  url: string;
}

const getPoxCycle = async (stxAddress: string): Promise<number> => {
  const result = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
    contractName: 'stacking-dao-core-v1',
    functionName: 'get-pox-cycle',
    functionArgs: [],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  switch (result.type) {
    case (ClarityType.Int, ClarityType.UInt):
      return Number(result.value);
    default:
      return 0;
  }
  //   setCurrentCycleId(Number(result?.value));
};

const fetchNftType = async (stxAddress: string, id: IntegerType): Promise<number> => {
  const result = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
    contractName: 'stacking-dao-genesis-nft',
    functionName: 'get-genesis-type',
    functionArgs: [uintCV(id)],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  switch (result.type) {
    case (ClarityType.Int, ClarityType.UInt):
      return Number(result.value);
    default:
      return 0;
  }
};

const fetchNft = async (stxAddress: string, id: IntegerType): Promise<IUnstackNFTData> => {
  const result = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
    contractName: 'stacking-dao-core-v1',
    functionName: 'get-withdrawals-by-nft',
    functionArgs: [uintCV(id)],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const data = (result as any)?.data;

  return {
    id,
    'cycle-id': Number(data['cycle-id']?.value),
    'ststx-amount': Number(data['ststx-amount']?.value) / 1000000,
    'stx-amount': Number(data['stx-amount']?.value) / 1000000,
  };
};

const fetchNftBalance = async (stxAddress: string): Promise<IUnstackNFTData[]> => {
  const identifier = `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.ststx-withdraw-nft::ststx-withdraw`;

  // Alternative
  // https://github.com/hirosystems/stacks-blockchain-api/pull/936
  const url =
    coreApiUrl +
    `/extended/v1/tokens/nft/holdings?principal=${stxAddress}&asset_identifiers[]=${identifier}`;

  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();

  const unstackNfts: IUnstackNFTData[] = [];

  if (data['results']?.length > 0) {
    const arr = data['results'].map((el: any) => el['value']['repr'].replace('u', ''));
    for await (const id of arr) {
      const nft = await fetchNft(stxAddress, id);

      unstackNfts.push(nft);
    }
  }

  return unstackNfts;
};

const fetchGenesisBalance = async (stxAddress: string): Promise<IGenesisNFTData[]> => {
  const identifier = `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-dao-genesis-nft::stacking-dao-genesis`;
  const url =
    coreApiUrl +
    `/extended/v1/tokens/nft/holdings?principal=${stxAddress}&asset_identifiers[]=${identifier}`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();

  if (!data['results']?.length) return [];

  const result: IntegerType[] = data['results'].map((el: any) =>
    el['value']['repr'].replace('u', '')
  );

  const nfts: IGenesisNFTData[] = [];

  const typeMapping: Record<number, { name: string; url: string }> = {
    0: { name: 'Normal', url: '/genesis-nft.png' },
    1: { name: 'OG', url: '/genesis-og.png' },
    2: { name: 'Gold', url: '/genesis-gold.png' },
    3: { name: 'Diamond', url: '/genesis-diamond.png' }, // default case
  };

  for (const id of result) {
    const type = await fetchNftType(stxAddress, id);
    const info = typeMapping[type] ?? typeMapping[3];

    nfts.push({ id, type: type, name: info.name, url: info.url });
  }

  return nfts;
};

const fetchBitflowBalance = async (stxAddress: string): Promise<BitflowBalance> => {
  const resultWallet = callReadOnlyFunction({
    contractAddress: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
    contractName: 'stx-ststx-lp-token-v-1-1',
    functionName: 'get-balance',
    functionArgs: [standardPrincipalCV(stxAddress)],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const resultWallet2 = callReadOnlyFunction({
    contractAddress: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
    contractName: 'stx-ststx-lp-token-v-1-2',
    functionName: 'get-balance',
    functionArgs: [standardPrincipalCV(stxAddress)],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const resultStaked = callReadOnlyFunction({
    contractAddress: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
    contractName: 'earn-stx-ststx-v-1-1',
    functionName: 'get-user-data',
    functionArgs: [
      contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, 'ststx-token'),
      contractPrincipalCV('SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M', 'stx-ststx-lp-token-v-1-1'),
      standardPrincipalCV(stxAddress),
    ],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const resultStaked2 = callReadOnlyFunction({
    contractAddress: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
    contractName: 'earn-stx-ststx-v-1-2',
    functionName: 'get-user-data',
    functionArgs: [
      contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, 'ststx-token'),
      contractPrincipalCV('SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M', 'stx-ststx-lp-token-v-1-2'),
      standardPrincipalCV(stxAddress),
    ],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const [wallet, wallet2, staked, staked2] = await Promise.all([
    resultWallet,
    resultWallet2,
    resultStaked,
    resultStaked2,
  ]);

  const walletBalance = cvToJSON(wallet).value.value;
  const stakeBalance = cvToJSON(staked).value
    ? cvToJSON(staked).value.value['total-currently-staked'].value
    : 0;

  const walletBalance2 = cvToJSON(wallet2).value.value;
  const stakeBalance2 = cvToJSON(staked2).value
    ? cvToJSON(staked2).value.value['total-currently-staked'].value
    : 0;

  return {
    lpWallet: Number(walletBalance) / 1000000,
    lpStaked: Number(stakeBalance) / 1000000,
    lpWallet2: Number(walletBalance2) / 1000000,
    lpStaked2: Number(stakeBalance2) / 1000000,
  };
};

const fetchZestLendingProvision = async (stxAddress: string): Promise<number> => {
  let resultLendingZest;
  try {
    resultLendingZest = await callReadOnlyFunction({
      contractAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N',
      contractName: 'pool-read-supply',
      functionName: 'get-supplied-balance-user-ststx',
      functionArgs: [standardPrincipalCV(stxAddress)],
      senderAddress: stxAddress,
      network: stacksNetwork,
    });
  } catch (e) {
    // any exception
    return 0;
  }

  const lendingZestAmount = cvToJSON(resultLendingZest).value
    ? Number((resultLendingZest as any).value) / 1000000
    : 0;

  return lendingZestAmount;
};

const fetchVelarBalance = async (stxAddress: string): Promise<VelarBalance> => {
  const resultWallet = callReadOnlyFunction({
    contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1',
    contractName: 'ststx-aeusdc',
    functionName: 'get-balance',
    functionArgs: [standardPrincipalCV(stxAddress)],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const resultStaked = callReadOnlyFunction({
    contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1',
    contractName: 'farming-ststx-aeusdc-core',
    functionName: 'get-user-staked',
    functionArgs: [standardPrincipalCV(stxAddress)],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const [wallet, staked] = await Promise.all([resultWallet, resultStaked]);

  const walletBalance = cvToValue(wallet).value as number | undefined;
  const stakeBalance = cvToJSON(staked).value ? cvToJSON(staked).value['end'].value : 0;

  return {
    lpWallet: Number(walletBalance) / 1000000,
    lpStaked: Number(stakeBalance) / 1000000,
  };
};

const fetchArkadikoBalance = async (stxAddress: string): Promise<ArkadikoBalance> => {
  const vaultRes = await callReadOnlyFunction({
    contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    contractName: 'arkadiko-vaults-data-v1-1',
    functionName: 'get-vault',
    functionArgs: [
      standardPrincipalCV(stxAddress),
      contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, 'ststx-token'),
    ],
    senderAddress: stxAddress,
    network: stacksNetwork,
  });

  const vault = cvToJSON(vaultRes).value.value;

  return {
    vault: Number(vault.collateral.value) / 1000000 ?? 0,
  };
};

export function usePositionsData(stxAddress?: string): PositionsData {
  const { stStxBalance, stxBalance, stackingApy } = useAppContext();

  const [currentCycleId, setCurrentCycleId] = useState<number>(3);

  const [genesisNfts, setGenesisNfts] = useState<IGenesisNFTData[]>([]);
  const [unstackNfts, setUnstackNfts] = useState<IUnstackNFTData[]>([]);
  const [zestProvision, setZestProvision] = useState<number>(0);

  const [bitflowBalance, setBitflowBalance] = useState<BitflowBalance>({
    lpWallet: 0,
    lpStaked: 0,
    lpWallet2: 0,
    lpStaked2: 0,
  });

  const [velarBalance, setVelarBalance] = useState<VelarBalance>({
    lpWallet: 0,
    lpStaked: 0,
  });

  const [arkadikoBalance, setArkadikoBalance] = useState<ArkadikoBalance>({
    vault: 0,
  });

  useEffect(() => {
    async function fetchData(stxAddress: string) {
      await Promise.all([
        getPoxCycle(stxAddress).then(setCurrentCycleId),
        fetchNftBalance(stxAddress).then(setUnstackNfts),
        fetchBitflowBalance(stxAddress).then(setBitflowBalance),
        fetchGenesisBalance(stxAddress).then(setGenesisNfts),
        fetchZestLendingProvision(stxAddress).then(setZestProvision),
        fetchVelarBalance(stxAddress).then(setVelarBalance),
        fetchArkadikoBalance(stxAddress).then(setArkadikoBalance),
      ]).catch(console.error);
    }

    if (stxAddress) fetchData(stxAddress);
  }, [stxAddress]);

  const data: PositionsData = {
    stStxBalance,
    stxBalance,
    stackingApy,
    currentCycleId,
    genesisNfts,
    unstackNfts,
    bitflowBalance,
    zestProvision,
    velarBalance,
    arkadikoBalance,
  };

  return data;
}
