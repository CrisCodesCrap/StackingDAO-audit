require('dotenv').config({path: '../.env'});
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'stacking-pool-v1';
const FUNCTION_NAME = 'set-cycle-to-signer-signature';
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.uintCV(561),
    tx.bufferCV(
      Buffer.from(
        '4f9c8ed19acc818bbf11d2c064185b8c3f20fa42b4d5a899cd58669df37ca4332fa8970fde222eccf6006ea7d2ec304895b605d1ae515380f19c45531cd73ac501',
        "hex"
      )
    )
  ],
  fee: new BN(100001, 10),
  nonce: new BN(45, 10),
  senderKey: process.env.STACKS_PRIVATE_KEY,
  postConditionMode: 1,
  network: network,
  clarityVersion: tx.ClarityVersion.Clarity2
};

async function transact() {
  const transaction = await tx.makeContractCall(txOptions);
  console.log(transaction, network);
  const broadcast_id = await tx.broadcastTransaction(transaction, network);
  console.log(broadcast_id);
};

transact();
