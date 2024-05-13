require('dotenv').config({path: '../.env'});
const tx = require('@stacks/transactions');
const utils = require('../utils');
const miners = {};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// https://forum.stacks.org/t/proposed-sip-modify-coinbase-reward-per-block-and-halving-schedule/13182
// const coreApiUrl = 'https://api.hiro.so';
const coreApiUrl = "https://small-solemn-frost.stacks-mainnet.discover.quiknode.pro/deaf86bafdfbef850e40cdf5fa22c41cd447cdff"


async function exec() {
  let offset = 0;

  while (offset < 2100) {
    const url = `${coreApiUrl}/extended/v2/blocks?limit=30&offset=${offset}`;
    const response = await fetch(url, { credentials: 'omit' });
    const data = await response.json();

    await asyncForEach(data['results'], async (result) => {
      const blockUrl = `${coreApiUrl}/extended/v2/blocks/${result.height}/transactions`;
      const response = await fetch(blockUrl, { credentials: 'omit' });
      const blockData = await response.json();

      const miner = blockData['results'][0]['sender_address'];
      console.log(`${result.height} - ${result.miner_txid} - ${miner}`);
      if (miners[miner]) {
        miners[miner] = miners[miner] + 1;
      } else {
        miners[miner] = 1;
      }
      // await sleep(1000);
    });

    offset += 30;
  }

  console.log(miners);
}

exec();
