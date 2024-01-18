require('dotenv').config();
const utils = require('./utils.js');

const scriptAddresses = require('./points-1-addresses.js');
const scriptAggregate = require('./points-2-aggregate.js');

//
// Main
//

async function start() {

  const lastBlockHeight = await utils.readFile('points-last-block');
  const currentBlockHeight = await utils.getBlockHeight();
  const nextBlockHeight = lastBlockHeight.last_block + 144;

  console.log("[run] Next block:", nextBlockHeight, ", current block:", currentBlockHeight);

  if (currentBlockHeight > nextBlockHeight) {

    await scriptAddresses.start();
    await scriptAggregate.start();

  }

};

start();

