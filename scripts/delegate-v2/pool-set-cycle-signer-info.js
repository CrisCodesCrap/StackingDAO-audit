require('dotenv').config({path: '../.env'});
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'stacking-pool-signer-chorus-one-v1';
const FUNCTION_NAME = 'set-cycle-signer-info';
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.uintCV(84),
    tx.stringAsciiCV('agg-increase'),
    tx.tupleCV({ 'hashbytes': tx.bufferCV(Buffer.from('2fffa9a09bb7fa7dced44834d77ee81c49c5f0cc', "hex")), version: tx.bufferCV(Buffer.from('04', "hex")), }),
    tx.uintCV("999999999000000000000"),
    tx.uintCV(31212),
    tx.bufferCV(Buffer.from('034df3feda207a1cd4f31ae2b58f136a0d382d23419ef8d06569fa538202ba8aed', 'hex')),
    tx.bufferCV(Buffer.from('fd9ab549ace46da2ee86f926f7030c716d5680d9be3fb6fc08d3d80ddb6bc43f35118359af28a2cc206f67b6af19b8dbcdea466730735c5153835cdc6093fc2801', 'hex'))
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
