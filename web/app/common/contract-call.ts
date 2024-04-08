import { StacksNetwork } from '@stacks/network';
import {
  ClarityValue,
  PostCondition,
  PostConditionMode,
  cvToHex,
  serializePostCondition,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect-react';
import { resolveProvider } from './utils';

export type ContractCallOptions = {
  stxAddress: string;
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  network?: StacksNetwork;
  postConditionMode?: PostConditionMode;
  postConditions?: PostCondition[];
};

export async function makeContractCall(
  options: ContractCallOptions,
  onComplete: (error?: any, txId?: any) => void
) {
  const provider = resolveProvider();

  if (provider?.isOkxWallet) {
    const transaction = {
      stxAddress: options.stxAddress,
      txType: 'contract_call',
      contractName: options.contractName,
      contractAddress: options.contractAddress,
      functionName: options.functionName,
      functionArgs: options.functionArgs.map(arg => cvToHex(arg)),
      postConditions: options.postConditions?.map(pc =>
        Buffer.from(serializePostCondition(pc)).toString('hex')
      ),
      postConditionMode: options.postConditionMode,
      anchorMode: 3,
    };
    const { txHash } = await provider.signTransaction(transaction);
    // console.log({txHash, signature});
    onComplete(null, txHash);
  } else {
    await openContractCall(
      {
        contractAddress: options.contractAddress,
        contractName: options.contractName,
        functionName: options.functionName,
        functionArgs: options.functionArgs,
        postConditions: options.postConditions,
        postConditionMode: options.postConditionMode,
        network: options.network,
        onFinish: async data => {
          if (data.txId) {
            onComplete(null, data.txId);
          } else {
            onComplete('contract call error..', null);
          }
        },
      },
      provider || window.StacksProvider
    );
  }
}
