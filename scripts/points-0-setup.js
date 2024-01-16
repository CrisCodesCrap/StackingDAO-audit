require('dotenv').config();
const utils = require('./utils.js');

//
// Main
//

async function start() {

  // Create needed files

  await utils.writeFile('points-last-block', { last_block: 132200 })
  await utils.writeFile('points-aggregate', { })

  const lastBlock = await utils.readFile('points-last-block');
  console.log("Got last block:", lastBlock);

  const aggregate = await utils.readFile('points-aggregate');
  console.log("Got aggregate:", aggregate);
};

start();
