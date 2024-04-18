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
    tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-pool-v1'),
    tx.listCV([
      tx.tupleCV({
        'delegate': tx.contractPrincipalCV(CONTRACT_ADDRESS, 'stacking-delegate-1-1'),
        'amount': tx.uintCV(6000000 * 1000000)
      })
    ])
  ],
  nonce: new BN(41, 10),
  fee: new BN(100000, 10),
  senderKey: process.env.STACKS_PRIVATE_KEY,
  postConditionMode: 1,
  network: network,
  clarityVersion: tx.ClarityVersion.Clarity2
};

async function transact() {
  console.log(CONTRACT_ADDRESS, CONTRACT_NAME);
  const transaction = await tx.makeContractCall(txOptions);
  console.log(network);
  const broadcast_id = await tx.broadcastTransaction(transaction, network);
  console.log(broadcast_id);
  // console.log(result);
  // await utils.processing(result, transaction.txid(), 0);
};

transact();
