require('dotenv').config({path: '../.env'});
const tx = require('@stacks/transactions');
const utils = require('../utils');
const fs = require('fs');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function exec() {
  try {
    const info = await tx.callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'strategy-v2',
      functionName: 'get-outflow-inflow',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    console.log(tx.cvToJSON(info));
  } catch (error) {
    console.log('Failure:', error);
  }
}

exec();
