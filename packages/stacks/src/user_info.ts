import * as tx from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { coreApiUrl } from './constants';
import { Balances } from '@repo/database/src/models';

//
// Constants
//

const network = new StacksMainnet({ url: coreApiUrl() });
const pointsContract = {
  address: process.env.CONTRACT_ADDRESS!,
  queries: {
    userWallet: {
      contract: 'block-info-v5',
      function: 'get-user-wallet',
    },
    bitflow: {
      contract: 'block-info-v5',
      function: 'get-user-bitflow',
    },
    zest: {
      contract: 'block-info-v9',
      function: 'get-user-zest',
    },
    arkadiko: {
      contract: 'block-info-v6',
      function: 'get-user-arkadiko',
    },
    velar: {
      contract: 'block-info-v8',
      function: 'get-user-velar',
    },
    hermetica: {
      contract: 'block-info-v11',
      function: 'get-user-hermetica',
    },
  },
} as const;

//
// Contract calls
//

async function userBalance(
  contract: { contract: string; function: string },
  address: string,
  blockHeight: number
): Promise<number> {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.address,
      contractName: contract.contract,
      functionName: contract.function,
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: pointsContract.address,
      network: network,
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result;
  } catch (error) {
    console.log('[3-aggregate] Fetch failed, retry in 2 seconds..', error);
    await new Promise(r => setTimeout(r, 2 * 1000));
    return await userBalance(contract, address, blockHeight);
  }
}

interface Totals {
  lp_balance: number;
  defi_balance: number;
  total: number;
}

export async function userInfoAtBlock(
  wallet: string,
  blockHeight: number
): Promise<[Balances, Totals]> {
  const [ststx, bitflow, zest, arkadiko, velar, hermetica] = await Promise.all([
    userBalance(pointsContract.queries.userWallet, wallet, blockHeight),
    userBalance(pointsContract.queries.bitflow, wallet, blockHeight),
    userBalance(pointsContract.queries.zest, wallet, blockHeight),
    userBalance(pointsContract.queries.arkadiko, wallet, blockHeight),
    userBalance(pointsContract.queries.velar, wallet, blockHeight),
    userBalance(pointsContract.queries.hermetica, wallet, blockHeight),
  ]);

  return [
    // Individual balances
    { blockHeight, wallet, ststx, bitflow, zest, arkadiko, velar, hermetica },
    // Totals
    {
      lp_balance: bitflow,
      defi_balance: zest + arkadiko + velar + hermetica,
      total: ststx + zest + arkadiko + velar + hermetica + bitflow,
    },
  ];
}
