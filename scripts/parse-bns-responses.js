require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');
const fs = require("fs");
const { parse } = require("csv-parse");

async function getBns(name) {
  const execTx = await tx.callReadOnlyFunction({
    contractAddress: 'SP000000000000000000002Q6VF78',
    contractName: 'bns',
    functionName: 'name-resolve',
    functionArgs: [
      tx.bufferCVFromString('btc'),
      tx.bufferCVFromString(name.split('.btc')[0].toLowerCase())
    ],
    senderAddress: 'SP000000000000000000002Q6VF78',
    network
  });

  if (tx.cvToJSON(execTx)['value']['value'] !== 2013) {
    console.log(tx.cvToJSON(execTx)['value']['value']['owner']['value']);
    return tx.cvToJSON(execTx)['value']['value']['owner']['value'];
  }

  return null;
}

fs.createReadStream("./typeform-responses.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", async function (row) {
    let addy = row[0];
    if (!row[0].startsWith('SP') && !row[0].startsWith('0x') && row[0].includes('.btc')) {
      //addy = await getBns(row[0]);
    } else {
      console.log(row[0]);
    }
  })
