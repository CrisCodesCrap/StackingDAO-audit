require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const helpers = require('./helpers.js');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ---------------------------------------------------------
// Write
// ---------------------------------------------------------

async function prepareStackingDao() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'stacking-pool-v1',
    functionName: 'prepare-stacking-dao',
    functionArgs: [],
    fee: new BN(1000000, 10),
    senderKey: process.env.PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = await tx.broadcastTransaction(transaction, network);
  return await utils.waitForTransactionCompletion(result, transaction.txid(), 0);
};

async function prepareOthers(delegates) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'stacking-pool-v1',
    functionName: 'prepare-delegate-many',
    functionArgs: [
      tx.listCV(delegates.map(delegate => tx.standardPrincipalCV(delegate)))
    ],
    fee: new BN(1000000, 10),
    senderKey: process.env.PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = await tx.broadcastTransaction(transaction, network);
  return await utils.waitForTransactionCompletion(result, transaction.txid(), 0);
}

// ---------------------------------------------------------
// Run
// ---------------------------------------------------------

async function run() {
  const canPrepareResult = await helpers.canPrepare();
  console.log("Can prepare:", canPrepareResult);

  // if (canPrepareResult) {

  //   // TODO: check if actually need to prepare

  //   const result = await prepareStackingDao();
  //   console.log("result", result);


  //   // TODO: others that delegated

  // }


  const poxEvents = await utils.getAllEvents("SP000000000000000000002Q6VF78.pox-3");
  console.log("poxEvents", poxEvents);

}

run();