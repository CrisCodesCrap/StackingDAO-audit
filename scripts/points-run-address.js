require('dotenv').config();
const utils = require('./utils.js');

const scriptAggregate = require('./points-2-aggregate.js');

//
// Main
//

async function start(address, blockHeight) {
  const info = await scriptAggregate.userInfoAtBlock(address, blockHeight);

  console.log(info);
};

start('SP35GN8KN63CB87DGPF7T1C6P07RHNTFCC1T4TWCV', 144731);

