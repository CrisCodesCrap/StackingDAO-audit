require('dotenv').config({path: '../.env'});
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'strategy-v2';
const FUNCTION_NAME = 'perform-pool-delegation';
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-pool-signer-restake-v1'),
    tx.listCV([
      tx.tupleCV({
        'delegate': tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-restake-1-1'),
        'amount': tx.uintCV(1200000 * 1000000)
      }),
    ])
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
