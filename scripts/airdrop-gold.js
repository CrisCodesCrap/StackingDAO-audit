require('dotenv').config();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const goldAddresses = [
  'SPKNGD6C2Z39RSCRSX85AGG3XZTEWEADVHEMSK99',
  'SP36S1NP9TXWWZ6R4AMT8A47348NPZ8MB3ZJ5M2BZ',
  'SP2YQCF4DMRWRPKD0EVNDY3AJ0BBS9FQH548GCHND',
  'SPYS1T0BYTHAF65CZYN1A8N2E894KXFP6BAJYRJ2',
  'SP1Q101VZRDSP3QR2AJ5DCJXV3FSE4ADNKET4PV1F',
  'SP1WGJ08BNHRJQ4D3EV2DRKBD2N6EVZ18ENAJHRWX',
  'SP1AJJNKA70PXD14RGPWG5NHNM1WAEZVQD7HNK8D3',
  'SP2Q1ZXVTXGXP0TPQG1D367NHF3BN89KJW26X1DG5',
  'SPJD6SHARBKY79Q0A1ZM8ZKYJ3SRJDWDWR8N6758',
  'SP213476CCYBPEN784GPAPNYTHFCGGP11V5MZV04D',
  'SP1BZETY7YC9QYV12ZFYPA8ZVCYCD65WTNWGNCKHV',
  'SP1KPFR7V580ET246ZN29HD4RVQYE2SY0WKHXVBRR',
  'SPNW7SQMGBND9WRZY4EG4R45QMW8BA6KEQY7B622',
  'SP3CPMGQNXZ3645PF168TRN3NKB1NY4QE39E4ZA3T',
  'SP1HY5GZQB7A2AB5M2FKD3TAH1HGXAJD0V7T8A4ZJ',
  'SP1YK1VXJXD2RWTZ6M8TNB99KQZX0EXJ9RJ591E15'
];

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function dropIt(arr, nonce) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'stacking-dao-genesis-nft-minter-v2',
    functionName: 'airdrop-many',
    functionArgs: [
      tx.listCV(arr)
    ],
    fee: new BN(2500000, 10),
    nonce: new BN(nonce, 10),
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  return utils.processing(result, transaction.txid(), 0);
};

const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
let pieces = chunk(goldAddresses, 25);
const cvs = pieces[0].map((piece) => tx.tupleCV({ 'recipient': tx.standardPrincipalCV(piece), 'type': tx.uintCV(2) }));
dropIt(cvs, 71);
