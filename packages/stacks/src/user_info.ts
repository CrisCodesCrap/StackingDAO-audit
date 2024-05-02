import * as tx from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { coreApiUrl } from './constants';
//
// Constants
//

// const client = new SmartContractsApi();

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
    // const userInfo = await client.callReadOnlyFunction({
    //   contractAddress: pointsContract.address,
    //   contractName: contract.contract,
    //   functionName: contract.function,
    //   readOnlyFunctionArgs: {
    //     sender: pointsContract.address,
    //     arguments: [cvToHex(tx.standardPrincipalCV(address)), cvToHex(tx.uintCV(blockHeight))],
    //   },
    // });

    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.address,
      contractName: contract.contract,
      functionName: contract.function,
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: pointsContract.address,
      network: network,
    });

    // if (!userInfo.okay || !userInfo.result) throw new Error(userInfo.cause);

    // const result = tx.cvToJSON(hexToCV(userInfo.result)).value.value;
    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    // TODO: this can result in a deadlock, implement a proper retry mechanism.
    console.log('[3-aggregate] Fetch failed, retry in 2 seconds..', error);
    await new Promise(r => setTimeout(r, 2 * 1000));
    return await userBalance(contract, address, blockHeight);
  }
}

export async function userInfoAtBlock(address: string, blockHeight: number) {
  const [wallet, bitflow, zest, arkadiko, velar, hermetica] = await Promise.all([
    userBalance(pointsContract.queries.userWallet, address, blockHeight),
    userBalance(pointsContract.queries.bitflow, address, blockHeight),
    userBalance(pointsContract.queries.zest, address, blockHeight),
    userBalance(pointsContract.queries.arkadiko, address, blockHeight),
    userBalance(pointsContract.queries.velar, address, blockHeight),
    userBalance(pointsContract.queries.hermetica, address, blockHeight),
  ]);

  return {
    total: wallet + zest + arkadiko + velar + hermetica + bitflow,
    ststx_balance: wallet,
    defi_balance: zest + arkadiko + velar + hermetica,
    lp_balance: bitflow,
    bitflow: bitflow * 1_000_000,
    zest: zest * 1_000_000,
    arkadiko: arkadiko * 1_000_000,
    velar: velar * 1_000_000,
    hermetica: hermetica * 1_000_000,
  };
}
