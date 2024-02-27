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

async function preparePools() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'strategy-v3',
    functionName: 'prepare-pools',
    functionArgs: [],
    fee: new BN(1000000, 10),
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = await tx.broadcastTransaction(transaction, network);
  return await utils.waitForTransactionCompletion(result, transaction.txid(), 0);
};

async function prepareDelegates(pool) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'strategy-v3',
    functionName: 'prepare-delegates',
    functionArgs: [
      tx.contractPrincipalCV(pool.split(".")[0], pool.split(".")[1])
    ],
    fee: new BN(1000000, 10),
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = await tx.broadcastTransaction(transaction, network);
  return await utils.waitForTransactionCompletion(result, transaction.txid(), 0);
};

async function execute(pool, delegates) {
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
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = await tx.broadcastTransaction(transaction, network);
  return await utils.waitForTransactionCompletion(result, transaction.txid(), 0);
};

// ---------------------------------------------------------
// Read
// ---------------------------------------------------------

async function hasPreparedPools() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "strategy-v3",
    functionName: "has-prepared-pools",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

async function hasPreparedDelegates(pool) {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "strategy-v3",
    functionName: "has-prepared-delegates",
    functionArgs: [
      tx.contractPrincipalCV(pool.split(".")[0], pool.split(".")[1])
    ],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

async function hasExecutedPool(pool) {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "strategy-v3",
    functionName: "has-executed-pool",
    functionArgs: [
      tx.contractPrincipalCV(pool.split(".")[0], pool.split(".")[1])
    ],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

async function getActivePools() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "data-pools-v1",
    functionName: "get-active-pools",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result.map(elem => elem.value);
}

async function getPoolDelegates(pool) {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "data-pools-v1",
    functionName: "get-pool-delegates",
    functionArgs: [
      tx.contractPrincipalCV(pool.split(".")[0], pool.split(".")[1])
    ],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result.map(elem => elem.value);
}

// ---------------------------------------------------------
// Run
// ---------------------------------------------------------

async function run() {
  const canPrepareResult = await helpers.canPrepare();
  const hasPreparedPoolsResult = await hasPreparedPools()

  console.log("Can prepare:", canPrepareResult);
  console.log("Has prepared pools:", hasPreparedPoolsResult);

  if (canPrepareResult && !hasPreparedPoolsResult) {
    // Prepare pools
    console.log("Prepare pools..");
    await preparePools();

  } else if (canPrepareResult && hasPreparedPoolsResult) {

    const getActivePoolsResult = await getActivePools();
    console.log("Active pools:", getActivePoolsResult);

    console.log("\n")

    let transactionPromises = [];
    for (const activePool of getActivePoolsResult) {
      const hasPreparedDelegatesResult = await hasPreparedDelegates(activePool)
      console.log("Pool:", activePool);
      console.log(" - Has prepared delegates:", hasPreparedDelegatesResult);

      if (!hasPreparedDelegatesResult) {
        // Prepare pool delegates
        console.log(" - Prepare delegates..");
        transactionPromises.push(prepareDelegates(activePool))
        // await prepareDelegates(activePool)

      } else {
        const hasExecutedPoolResult = await hasExecutedPool(activePool)
        console.log(" - Has executed:", hasExecutedPoolResult);

        if (!hasExecutedPoolResult) {
          // Execute pool 
          const getPoolDelegatesResult = await getPoolDelegates(activePool);
          console.log(" - Pool delegates:", getPoolDelegatesResult);
          console.log(" - Execute..");
          transactionPromises.push(execute(activePool, getPoolDelegatesResult))
          // await execute(activePool, getPoolDelegatesResult);
        }
      }
    }

    console.log(" - TXs to broadcast:", transactionPromises.length);
    const resultPromises = await Promise.all(transactionPromises);
    console.log(" - TXs results:", resultPromises);
  }
}

run();