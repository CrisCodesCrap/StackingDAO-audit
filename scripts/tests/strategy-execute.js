require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('../utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const PRIVATE_KEY = "de433bdfa14ec43aa1098d5be594c8ffb20a31485ff9de2923b2689471c401b801"

const CONTRACT_NAME = 'strategy-v3';
const FUNCTION_NAME = 'execute';

const POOL = CONTRACT_ADDRESS + ".stacking-pool-v1"
const DELEGATES = [
  CONTRACT_ADDRESS + ".stacking-delegate-1-1",
  CONTRACT_ADDRESS + ".stacking-delegate-1-2",
  CONTRACT_ADDRESS + ".stacking-delegate-1-3",
]

async function transact() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: FUNCTION_NAME,
    functionArgs: [
      tx.contractPrincipalCV(POOL.split(".")[0], POOL.split(".")[1]),
      tx.listCV(DELEGATES.map(delegate => tx.contractPrincipalCV(delegate.split(".")[0], delegate.split(".")[1]))),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, "reserve-v1"),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, "rewards-v1"),
    ],
    fee: new BN(1000000, 10),
    senderKey: PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

transact();