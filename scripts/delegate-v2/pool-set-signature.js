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
    tx.uintCV(560),
    tx.bufferCV(
      Buffer.from(
        '1e07c6bae9b14ff69021b62a1b73fb4b636666e145f91f9af67414bd5ab0b4d165acdbb682efc94de64750fe1fe84bd73903445e01de78979c2a4da61283491e00',
        "hex"
      )
    )
  ],
  nonce: new BN(43, 10),
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
