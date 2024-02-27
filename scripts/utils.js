require('dotenv').config();
const network = require('@stacks/network');
const env = process.env.NETWORK_ENV;
const request = require('request-promise');
const fs = require('fs');
const { Upload } = require('@aws-sdk/lib-storage');
const { S3 } = require('@aws-sdk/client-s3');

// ----------------------------------------------
// TX
// ----------------------------------------------

async function processing(broadcastedResult, tx, count) {
  const url = `${resolveUrl()}/extended/v1/tx/${tx}`;
  var result = await fetch(url);
  var value = await result.json();

  if (value.tx_status === "success") {
    console.log(`Transaction ${tx} processed:`);
    console.log(value.tx_result.repr);
    return;

  } else if (value.tx_status === "abort_by_response") {
    console.log(`Transaction ${tx} failed!!`);
    console.log(value.tx_result.repr);  
    return;

  } else if (value.tx_status === "pending") {
    // console.log(value);
    console.log(count);

  } else if (value.tx_status === "abort_by_response") {
    console.log(`Transaction ${tx} failed!!`);
    console.log(value.tx_result.repr);  
  }

  if (count > 20) {
    console.log("failed after 20 tries");
    console.log(value);
    return false;
  }

  setTimeout(function() {
    return processing(broadcastedResult, tx, count + 1);
  }, 3000);
}

// ----------------------------------------------
// API
// ----------------------------------------------

async function getNonce(address) {
  const url = `${resolveUrl()}/v2/accounts/${address}?proof=0`;
  const result = await request(url, { json: true });
  return result.nonce;
}

async function getBlockHeight() {
  const url = `${resolveUrl()}/v2/info`;
  const result = await request(url, { json: true });
  const currentBlock = result['stacks_tip_height'];
  return currentBlock;
}
async function getBurnBlockHeight() {
  const url = `${resolveUrl()}/v2/info`;
  const result = await request(url, { json: true });
  const currentBlock = result['burn_block_height'];
  return currentBlock;
}

async function getAllEvents(contract) {
  var allEvents = [];

  var offset = 0;
  var events = await getEvents(contract, offset);
  allEvents = allEvents.concat(events);

  while (events.length > 0) {
    offset += 50;
    events = await getEvents(contract, offset);
    allEvents = allEvents.concat(events);
  }
  return allEvents;
}

async function getEvents(contract, offset) {
  console.log("[utils] Fetch events for contract:", contract, "- offset:", offset);
  try {
    const url = `${resolveUrl()}/extended/v1/contract/${contract}/events?limit=50&unanchored=false&offset=${offset}`;
    const result = await request(url, { json: true });
    return result.results;
  } catch (error) {
    console.log("[utils] Fetch failed, retry in 5 seconds. Error:", error);
    await new Promise(r => setTimeout(r, 5 * 1000));
    return getEvents(contract, offset);
  }
}

// ----------------------------------------------
// Network
// ----------------------------------------------

function resolveUrl() {
  if (env === 'mocknet') {
    return `http://localhost:${process.env.LOCAL_STACKS_API_PORT}`;
  } else if (env === 'testnet') {
    return 'https://api.testnet.hiro.so';
  } else if (env === 'regtest') {
    return 'https://stacks-node-api.regtest.stacks.co';
  } else {
    return 'https://api.hiro.so';
  }
}

function resolveNetwork() {
  if (env === 'mainnet') {
    const stacksNetwork = new network.StacksMainnet();
    stacksNetwork.coreApiUrl = resolveUrl();

    return stacksNetwork;
  } else {
    const stacksNetwork = new network.StacksTestnet();
    stacksNetwork.coreApiUrl = resolveUrl();

    return stacksNetwork;
  }
}

// ----------------------------------------------
// File management
// ----------------------------------------------

async function readFile(filename) {
  if (process.env.FILE_ENV == "remote") {
    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
      region: 'eu-central-1'
    });

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: filename + '.json',
    };
  
    // Check if file exists
    try {
      await s3.headObject(params);
    } catch (e) {
      return {};
    }
  
    const result = await s3.getObject(params);
    const jsonString = await result.Body?.transformToString()
    const json = JSON.parse(jsonString ?? '')

    return json;
  }

  // Local
  const data = fs.readFileSync("files/" + filename + ".json");
  return JSON.parse(data);
}

async function writeFile(filename, json) {
  if (process.env.FILE_ENV == "remote") {
    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
      region: 'eu-central-1'
    });

    const params = {
      ACL: "public-read",
      Bucket: process.env.AWS_BUCKET,
      Key: filename + '.json',
      Body: Buffer.from(JSON.stringify(json))
    };
  
    const result = await new Upload({
      client: s3,
      params,
    }).done();
    return result;
  }

  // Local
  fs.writeFileSync("files/" + filename + ".json", JSON.stringify(json, undefined, 2));
  return true;
}

// ----------------------------------------------
// Exports
// ----------------------------------------------

exports.resolveUrl = resolveUrl;
exports.resolveNetwork = resolveNetwork;
exports.processing = processing;
exports.getNonce = getNonce;
exports.getBlockHeight = getBlockHeight;
exports.getBurnBlockHeight = getBurnBlockHeight;
exports.getAllEvents = getAllEvents;
exports.readFile = readFile;
exports.writeFile = writeFile;
