require('dotenv').config({path: '../.env'});
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'stacking-pool-v1';
const FUNCTION_NAME = 'set-pox-reward-address';
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.tupleCV({
      'version': tx.bufferCV(Buffer.from('0x04', 'hex')),
      'hashbytes': tx.bufferCV(Buffer.from('0x7b6e2045e965e88e7af2276856b492c243dcb6d1', "hex"))
    })
  ],
  fee: new BN(100000, 10),
  senderKey: process.env.STACKS_PRIVATE_KEY,
  postConditionMode: 1,
  network: network,
  clarityVersion: tx.ClarityVersion.Clarity2
};

async function transact() {
  const transaction = await tx.makeContractCall(txOptions);
  const broadcast_id = await tx.broadcastTransaction(transaction, network);
  console.log(broadcast_id);
};

transact();
