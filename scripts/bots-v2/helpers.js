require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ---------------------------------------------------------
// Read
// ---------------------------------------------------------

async function getPoxCycle() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "strategy-v3",
    functionName: "get-pox-cycle",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

async function rewardCycleToBurnHeight(rewardCycle) {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "strategy-v3",
    functionName: "reward-cycle-to-burn-height",
    functionArgs: [
      tx.uintCV(rewardCycle)
    ],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}
async function getCycleWithdrawOffset() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "data-core-v1",
    functionName: "get-cycle-withdraw-offset",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

// ---------------------------------------------------------
// Can Prepare
// ---------------------------------------------------------

async function canPrepare() {
  console.log("Can prepare?")
  const burnBlock = await utils.getBurnBlockHeight();
  console.log(" - Burn block:", burnBlock);
  const poxCycle = await getPoxCycle();
  console.log(" - Current cycle:", poxCycle);
  const startBlockNextCycle = await rewardCycleToBurnHeight(poxCycle + 1);
  console.log(" - Start block next cycle:", startBlockNextCycle);
  const withdrawOffset = await getCycleWithdrawOffset();
  console.log(" - Withdraw offset:", withdrawOffset);
  return (burnBlock > startBlockNextCycle - withdrawOffset)
}

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

exports.canPrepare = canPrepare;
