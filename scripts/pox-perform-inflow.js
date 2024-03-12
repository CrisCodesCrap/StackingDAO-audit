require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'strategy-v0';
const FUNCTION_NAME = 'perform-inflow';

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.listCV([
      tx.uintCV(1220000 * 1000000),
      tx.uintCV(1290000 * 1000000),
      tx.uintCV(770000 * 1000000),
      tx.uintCV(680000 * 1000000),
      tx.uintCV(140000 * 1000000),
      tx.uintCV(20000 * 1000000),
      tx.uintCV(80000 * 1000000),
      tx.uintCV(80000 * 1000000),
      tx.uintCV(80000 * 1000000),
      tx.uintCV(80000 * 1000000)
    ])
  ],
  fee: new BN(5000000, 10),
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
