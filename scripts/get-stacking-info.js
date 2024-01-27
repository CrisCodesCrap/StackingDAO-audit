require('dotenv').config();
const utils = require('./utils.js');
const tx = require('@stacks/transactions');

//
// Contract calls
//

async function getStackerStacked(contractName) {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: process.env.CONTRACT_ADDRESS,
    contractName: contractName,
    functionName: "get-stx-account",
    functionArgs: [],
    senderAddress: process.env.CONTRACT_ADDRESS,
  });

  const result = tx.cvToJSON(readResult).value;

  return {
    locked: result.locked.value / 1000000,
    unlocked: result.unlocked.value / 1000000
  };
}

async function getOutflowInflow() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: process.env.CONTRACT_ADDRESS,
    contractName: "strategy-v0",
    functionName: "get-outflow-inflow",
    functionArgs: [],
    senderAddress: process.env.CONTRACT_ADDRESS,
  });

  const result = tx.cvToJSON(readResult).value;

  return {
    inflow: result.inflow.value / 1000000,
    outflow: result.outflow.value / 1000000
  };
}

async function getSlotAmount() {
  const url = utils.resolveUrl() + "/v2/pox";
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data.current_cycle.min_threshold_ustx / 1000000;
}

//
// Main
//

async function start() {
  const stackers = ["stacker-1", "stacker-2", "stacker-3", "stacker-4", "stacker-5", "stacker-6", "stacker-7", "stacker-8", "stacker-9", "stacker-10"]
  
  console.log("\n Slot amount:");
  const slotAmount = await getSlotAmount();
  const assumedSlotAmount = parseInt(slotAmount * 1.1);
  console.log("- Slot amount:", slotAmount);
  console.log("- Assumed amount:", assumedSlotAmount);

  console.log("\n Stackers info:")
  var totalToAdd = 0;
  for (const stacker of stackers) {
    const stackerInfo = await getStackerStacked(stacker);
    const slotOverpay = stackerInfo.locked % assumedSlotAmount;
    const toAdd = assumedSlotAmount - slotOverpay;
    totalToAdd += toAdd
    console.log("-", stacker, ":", stackerInfo, "- Slots:", (stackerInfo.locked / assumedSlotAmount), ", overpay:", slotOverpay, ", add:", toAdd);
  }
  console.log("--> Add to fill slots:", totalToAdd);

  console.log("\n Inflow / outflow info:")
  const inflowOutflow = await getOutflowInflow();
  console.log("-", inflowOutflow);

  if (inflowOutflow.inflow > 0) {
    const toDivide = inflowOutflow.inflow - totalToAdd;
    console.log("--> To divide:", toDivide);
    console.log("--> Slots to fill:", toDivide/assumedSlotAmount);
  }
};

start();
