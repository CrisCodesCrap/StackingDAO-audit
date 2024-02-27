require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ---------------------------------------------------------
// Write
// ---------------------------------------------------------


// ---------------------------------------------------------
// Read
// ---------------------------------------------------------

async function getSupportedProtocols() {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "data-direct-stacking-v1",
    functionName: "get-supported-protocols",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result.map(elem => elem.value);
}

async function calculateDirectStackingInfo(user, protocols) {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "direct-helpers-v1",
    functionName: "calculate-direct-stacking-info",
    functionArgs: [
      tx.contractPrincipalCV(CONTRACT_ADDRESS, "reserve-v1"),
      tx.listCV(protocols.map(protocol => tx.contractPrincipalCV(protocol.split(".")[0], protocol.split(".")[1]))),
      tx.standardPrincipalCV(user)
    ],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value;
  return result;
}

async function getUserBalanceInProtocol(user, protocol) {
  const readResult = await tx.callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: "direct-helpers-v1",
    functionName: "get-user-balance-in-protocol",
    functionArgs: [
      tx.standardPrincipalCV(user),
      tx.contractPrincipalCV(protocol.split(".")[0], protocol.split(".")[1]),
    ],
    senderAddress: CONTRACT_ADDRESS,
    network
  });

  const result = tx.cvToJSON(readResult).value.value;
  return result;
}


// ---------------------------------------------------------
// Run
// ---------------------------------------------------------

async function run() {
  // TODO:
  // - Need list of all addresses that are direct stacking
  // - 

  const supportedProtocols = await getSupportedProtocols();
  console.log("supportedProtocols", supportedProtocols);

  const directInfo = await getUserBalanceInProtocol(CONTRACT_ADDRESS, supportedProtocols[0]);
  console.log("directInfo", directInfo);

}

run();