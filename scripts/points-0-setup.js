require('dotenv').config();
const utils = require('./utils.js');

//
// Main
//

async function start() {

  // Create needed files

  await utils.writeFile('points-last-block-8', { last_block: 132200 })
  await utils.writeFile('points-last-block-addresses-8', { last_block: 132200 })
  await utils.writeFile('points-aggregate-8', { })

  const lastBlock = await utils.readFile('points-last-block-8');
  console.log("Got last block:", lastBlock);

  const lastBlockAddresses = await utils.readFile('points-last-block-addresses-8');
  console.log("Got last block addresses:", lastBlockAddresses);

  const aggregate = await utils.readFile('points-aggregate-8');
  console.log("Got aggregate:", aggregate);
};

start();
