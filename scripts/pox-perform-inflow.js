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
      tx.uintCV((120000 * 1000000) + (6 * 121000 * 1000000)),
      tx.uintCV((77000 * 1000000) + (4 * 121000 * 1000000)),
      tx.uintCV((88000 * 1000000) + (4 * 121000 * 1000000)),
      tx.uintCV((26000 * 1000000) + (3 * 121000 * 1000000)),
      tx.uintCV((55000 * 1000000) + (2 * 121000 * 1000000)),
      tx.uintCV(4000 * 1000000),
      tx.uintCV(102000 * 1000000),
      tx.uintCV(102000 * 1000000),
      tx.uintCV(102000 * 1000000),
      tx.uintCV(102000 * 1000000)
    ])
  ],
  fee: new BN(10000000, 10),
  nonce: new BN(26, 10),
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
