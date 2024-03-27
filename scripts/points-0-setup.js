require('dotenv').config();
const utils = require('./utils.js');

//
// Main
//

async function start() {

  // Create needed files

  await utils.writeFile('points-last-block-7', { last_block: 132200 })
  await utils.writeFile('points-last-block-addresses-7', { last_block: 132200 })
  await utils.writeFile('points-aggregate-7', { })

  const lastBlock = await utils.readFile('points-last-block-7');
  console.log("Got last block:", lastBlock);

  const lastBlockAddresses = await utils.readFile('points-last-block-addresses-7');
  console.log("Got last block addresses:", lastBlockAddresses);

  const aggregate = await utils.readFile('points-aggregate-7');
  console.log("Got aggregate:", aggregate);
};

start();
