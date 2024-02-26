require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const PRIVATE_KEY = "de433bdfa14ec43aa1098d5be594c8ffb20a31485ff9de2923b2689471c401b801"

const CONTRACT_NAME = 'strategy-v3';
const FUNCTION_NAME = 'prepare-pools';

async function transact() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: FUNCTION_NAME,
    functionArgs: [],
    fee: new BN(1000000, 10),
    senderKey: PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

async function canPrepare() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "can-prepare",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;

  return result;
}


async function run() {
  // const canPrepareResult = await canPrepare();
  // console.log("canPrepareResult", canPrepareResult);

  await transact()
}

run();