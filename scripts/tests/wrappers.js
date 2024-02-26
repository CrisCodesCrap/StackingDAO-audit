require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

const PK_WALLET_6 = "de433bdfa14ec43aa1098d5be594c8ffb20a31485ff9de2923b2689471c401b801"

async function strategyCanPrepare() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'strategy-v3',
    functionName: "can-prepare",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

async function strategyHasPreparedPools() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'strategy-v3',
    functionName: "has-prepared-pools",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

async function strategyPreparePools() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'strategy-v3',
    functionName: 'prepare-pools',
    functionArgs: [],
    fee: new BN(1000000, 10),
    senderKey: PK_WALLET_6,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

async function strategyPrepareDelegates(pool) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'strategy-v3',
    functionName: 'prepare-delegates',
    functionArgs: [
      tx.contractPrincipalCV(pool.split(".")[0], pool.split(".")[1])
    ],
    fee: new BN(1000000, 10),
    senderKey: PK_WALLET_6,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

async function strategyExecute(pool, delegates) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'strategy-v3',
    functionName: 'execute',
    functionArgs: [
      tx.contractPrincipalCV(pool.split(".")[0], pool.split(".")[1]),
      tx.listCV(delegates.map(delegate => tx.contractPrincipalCV(delegate.split(".")[0], delegate.split(".")[1]))),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, "reserve-v1"),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, "rewards-v1"),
    ],
    fee: new BN(1000000, 10),
    senderKey: PK_WALLET_6,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};


// ----------------------------------------------
// Exports
// ----------------------------------------------

exports.strategyCanPrepare = strategyCanPrepare;
exports.strategyHasPreparedPools = strategyHasPreparedPools;
exports.strategyPreparePools = strategyPreparePools;
exports.strategyPrepareDelegates = strategyPrepareDelegates;
exports.strategyExecute = strategyExecute;
