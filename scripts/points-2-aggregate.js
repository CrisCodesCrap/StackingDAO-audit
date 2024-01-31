require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils.js');

//
// Constants
//

const pointsContract = `${process.env.CONTRACT_ADDRESS}.block-info-v3`;

//
// Contract calls
//

// Before LP contract was deployed, we can only get stSTX wallet balance
async function userInfoAtBlockWithoutLP(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.split(".")[0],
      contractName: pointsContract.split(".")[1],
      functionName: "get-ststx-balance-at-block",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value.value;

    return {
      ststx_balance: result / 1000000,
      lp_balance: 0
    }
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 10 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
    return await userInfoAtBlockWithoutLP(address, blockHeight);
  }
}


// Once LP contract was deployed, we can take these tokens into account
async function userInfoAtBlockWithLP(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.split(".")[0],
      contractName: pointsContract.split(".")[1],
      functionName: "get-user-ststx-at-block",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value;

    return {
      ststx_balance: result["ststx-balance"].value / 1000000,
      lp_balance: result["lp-balance"].value / 1000000
    }
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 10 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
    return await userInfoAtBlockWithLP(address, blockHeight);
  }
}

// Once second LP deployed, we can take that into account
async function userInfoAtBlockWithLP2(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.split(".")[0],
      contractName: pointsContract.split(".")[1],
      functionName: "get-user-ststx-at-block-2",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value;

    return {
      ststx_balance: result["ststx-balance"].value / 1000000,
      lp_balance: result["lp-balance"].value / 1000000
    }
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 10 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
    return await userInfoAtBlockWithLP2(address, blockHeight);
  }
}


async function userInfoAtBlock(address, blockHeight) {
  if (blockHeight < 132631) {
    return await userInfoAtBlockWithoutLP(address, blockHeight);
  }
  if (blockHeight < 135640) {
    return await userInfoAtBlockWithLP(address, blockHeight);
  }
  return await userInfoAtBlockWithLP2(address, blockHeight);
}

//
// Loop
//

async function updateAllPoints(blockHeight) {
  const addresses = await utils.readFile('points-addresses-2');
  const referrals = await utils.readFile('points-referrals-2');
  const aggregate = await utils.readFile('points-aggregate-2');

  //
  // 0. From flat addresses array to chuncked array
  //
  const perChunk = 5;
  const addressesChunks = addresses.addresses.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index / perChunk)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray
  }, [])


  //
  // 1. Update user points
  //
  var counter = 0;
  for (const addressChunk of addressesChunks) {

    const allPromise = await Promise.all(addressChunk.map(address => userInfoAtBlock(address, blockHeight)));

    for (const address of addressChunk) {
      const addressIndex = addressChunk.indexOf(address);
      const userInfo = allPromise[addressIndex];

      const newPoints = userInfo.ststx_balance + userInfo.lp_balance * 2.5;

      if (!aggregate[address]) {
        aggregate[address] = {
          user_points: newPoints,
          referral_points: 0
        }
      } else {
        aggregate[address] = {
          user_points: aggregate[address].user_points + newPoints,
          referral_points: 0
        }
      }
    }

    console.log("[3-aggregate] Progress:", counter, "/", addressesChunks.length);
    counter++;
  }


  //
  // 2. Update referral points
  //
  for (const referrer of Object.keys(referrals)) {

    // Reset referral_points first
    aggregate[referrer] = {
      user_points: aggregate[referrer] ? aggregate[referrer].user_points : 0,
      referral_points: 0
    }

    for (const user of referrals[referrer]) {
      if (aggregate[user]) {
        const userPoints = aggregate[user].user_points;

        if (!aggregate[referrer]) {
          aggregate[referrer] = {
            user_points: 0,
            referral_points: userPoints * 0.1
          }
        } else {
          aggregate[referrer].referral_points = aggregate[referrer].referral_points + userPoints * 0.1;
        }
      }
    }
  }

  return aggregate;
}


//
// Main
//

async function start() {
  const lastBlockHeight = await utils.readFile('points-last-block-2');
  const currentBlockHeight = await utils.getBlockHeight();
  const nextBlockHeight = lastBlockHeight.last_block + 144;

  console.log("[3-aggregate] Next block:", nextBlockHeight, ", current block:", currentBlockHeight);

  if (currentBlockHeight > nextBlockHeight) {
    console.log("[3-aggregate] Updating points for block:", nextBlockHeight);

    const aggregate = await updateAllPoints(nextBlockHeight);
    console.log("[3-aggregate] Got users:", Object.keys(aggregate).length);

    await utils.writeFile('points-aggregate-2', aggregate)
    await utils.writeFile('points-last-block-2', { last_block: nextBlockHeight })
  }
};

// start();

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

exports.start = start;
