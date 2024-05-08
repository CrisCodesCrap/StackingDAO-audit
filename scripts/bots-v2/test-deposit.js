require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const CONTRACT_NAME = 'stacking-dao-core-v2';
const FUNCTION_NAME = 'deposit';

const STX_AMOUNT = '250000';

async function transact() {

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: FUNCTION_NAME,
    functionArgs: [
      tx.contractPrincipalCV(CONTRACT_ADDRESS, "reserve-v1"),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, "direct-helpers-v1"),
      tx.uintCV(STX_AMOUNT * 1000000),
      tx.noneCV(),
      tx.noneCV()
    ],
    fee: new BN(1000000, 10),
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

transact();