require('dotenv').config({path: '../.env'});
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'data-pools-v1';
const FUNCTION_NAME = 'set-pool-delegates';
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-pool-v1'),
    tx.listCV([
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-1-1'),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-1-2'),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-1-3'),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-1-4'),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-1-5'),
    ])
  ],
  fee: new BN(100000, 10),
  senderKey: process.env.STACKS_PRIVATE_KEY,
  postConditionMode: 1,
  network: network,
  clarityVersion: tx.ClarityVersion.Clarity2
};

async function transact() {
  const transaction = await tx.makeContractCall(txOptions);
  const broadcast_id = await tx.broadcastTransaction(transaction, network);
  console.log(broadcast_id);
};

transact();
