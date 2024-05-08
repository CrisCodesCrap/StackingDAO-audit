require('dotenv').config();
const utils = require('./utils.js');
const tx = require('@stacks/transactions');

//
// Contract calls
//

async function getStackerStacked() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: process.env.CONTRACT_ADDRESS,
    contractName: "block-info-v4",
    functionName: "get-user-ststx-at-block",
    functionArgs: [
      tx.standardPrincipalCV("SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"),
      tx.uintCV(140527)
    ],
    senderAddress: process.env.CONTRACT_ADDRESS,
  });

  const result = tx.cvToJSON(readResult);

  return result
}

//
// Main
//

async function start() {
  const result = await getStackerStacked();
  console.log("GOT", result);
};

start();

