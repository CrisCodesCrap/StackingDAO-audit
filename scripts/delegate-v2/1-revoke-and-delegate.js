require('dotenv').config({path: '../.env'});
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'delegates-handler-v1';
const FUNCTION_NAME = 'revoke-and-delegate';
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-1'),
    tx.contractPrincipalCV(CONTRACT_ADDRESS, 'reserve-v1'),
    tx.contractPrincipalCV(CONTRACT_ADDRESS, 'rewards-v1'),
    tx.uintCV(6000000 * 1000000),
    tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-pool-v1'),
    tx.uintCV(5000000)
  ],
  fee: new BN(100000, 10),
  senderKey: process.env.STACKS_PRIVATE_KEY,
  postConditionMode: 1,
  network
};

async function transact() {
  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

transact();
