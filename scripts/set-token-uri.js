require('dotenv').config();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'stacking-dao-genesis-nft';
const FUNCTION_NAME = 'set-base-token-uri';
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const txOptions = {
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: FUNCTION_NAME,
  functionArgs: [
    tx.stringAsciiCV('https://pd4mraf4faguwqoemhp5yy2jr7kpcwwkpbrdkkidbaywklicpsaa.arweave.net/ePjIgLwoDUtBxGHf3GNJj9TxWsp4YjUpAwgxZS0CfIA/metadata/')
  ],
  fee: new BN(400000, 10),
  senderKey: process.env.STACKS_PRIVATE_KEY,
  postConditionMode: 1,
  network
};

async function transact() {
  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

transact();
