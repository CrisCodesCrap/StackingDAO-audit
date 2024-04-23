require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils.js');

//
// Constants
//

const pointsContract = `${process.env.CONTRACT_ADDRESS}.block-info-v5`;

//
// Contract calls
//

async function userWalletAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.split(".")[0],
      contractName: pointsContract.split(".")[1],
      functionName: "get-user-wallet",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise(r => setTimeout(r, 2 * 1000));
    return await userWalletAtBlock(address, blockHeight);
  }
}

async function userBitflowLpAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v10",
      functionName: "get-user-bitflow",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise(r => setTimeout(r, 2 * 1000));
    return await userBitflowLpAtBlock(address, blockHeight);
  }
}


async function userZestAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v9",
      functionName: "get-user-zest",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise(r => setTimeout(r, 2 * 1000));
    return await userZestAtBlock(address, blockHeight);
  }
}

async function userArkadikoAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v6",
      functionName: "get-user-arkadiko",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise(r => setTimeout(r, 2 * 1000));
    return await userArkadikoAtBlock(address, blockHeight);
  }
}

async function userVelarAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v8",
      functionName: "get-user-velar",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise(r => setTimeout(r, 2 * 1000));
    return await userVelarAtBlock(address, blockHeight);
  }
}

async function userBoostInfoAtBlockHelper(address, blockHeight) {
  const [
    wallet, 
    bitflow,
    zest,
    arkadiko,
    velar
  ] = await Promise.all([
    userWalletAtBlock(address, blockHeight), 
    userBitflowLpAtBlock(address, blockHeight),
    userZestAtBlock(address, blockHeight),
    userArkadikoAtBlock(address, blockHeight),
    userVelarAtBlock(address, blockHeight)
  ]);

  return wallet + zest + arkadiko + velar + bitflow;
}

// 5x boost for cycle 81
async function userBoostCycle81(address) {
  const blockHeightStartCycle81 = 143630;
  const blockHeightEndCycle81 = blockHeightStartCycle81 + 2100;

  const startAmount = await userBoostInfoAtBlockHelper(address, blockHeightStartCycle81);
  const endAmount = await userBoostInfoAtBlockHelper(address, blockHeightEndCycle81);

  if (endAmount >= startAmount) {
    return startAmount * 5;
  }
  return 0;
}

//
// Loop
//

async function updateAllPoints() {
  const [
    addresses, 
    referrals,
    aggregate,
  ] = await Promise.all([
    utils.readFile('points-addresses-10'),
    utils.readFile('points-referrals-10'),
    utils.readFile('points-aggregate-10')
  ]);

  console.log("[3-aggregate] Got files from S3");

  //
  // 0. From flat addresses array to chuncked array
  //
  const perChunk = 100;
  const addressesChunks = addresses.addresses.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index / perChunk)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray
  }, [])

  console.log("[3-aggregate] Created chunks");

  //
  // 1. Update user points
  //
  var counter = 0;
  for (const addressChunk of addressesChunks) {

    const allPromise = await Promise.all(addressChunk.map(address => userBoostCycle81(address)));

    for (const address of addressChunk) {
      const addressIndex = addressChunk.indexOf(address);
      const boostPoints = allPromise[addressIndex];

      console.log("-", address, "-", boostPoints);

      if (!aggregate[address]) {
        aggregate[address] = {
          user_points: newPoints,
          referral_points: 0
        }
      } else {
        aggregate[address] = {
          user_points: aggregate[address].user_points + boostPoints,
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
  console.log("[3-aggregate] Updating points with boost");

  const aggregate = await updateAllPoints();
  console.log("[3-aggregate] Got users:", Object.keys(aggregate).length);

  await utils.writeFile('points-aggregate-10', aggregate)
};

start();

