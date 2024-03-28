require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils.js');

//
// Constants
//

const pointsContract = `${process.env.CONTRACT_ADDRESS}.block-info-v5`;
const pointsHelperContract = `${process.env.CONTRACT_ADDRESS}.block-info-helper-v3`;

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
    console.log("[3-aggregate] Fetch failed, retry in 10 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
    return await userWalletAtBlock(address, blockHeight);
  }
}

async function userBitflowAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.split(".")[0],
      contractName: pointsContract.split(".")[1],
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
    console.log("[3-aggregate] Fetch failed, retry in 10 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
    return await userBitflowAtBlock(address, blockHeight);
  }
}

async function userZestAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsHelperContract.split(".")[0],
      contractName: pointsHelperContract.split(".")[1],
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
    console.log("[3-aggregate] Fetch failed, retry in 10 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
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
    console.log("[3-aggregate] Fetch failed, retry in 10 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
    return await userZestAtBlock(address, blockHeight);
  }
}

async function userInfoAtBlockHelper(address, blockHeight) {
  const wallet = await userWalletAtBlock(address, blockHeight);
  const bitflow = await userBitflowAtBlock(address, blockHeight);
  const zest = await userZestAtBlock(address, blockHeight);
  const arkadiko = await userArkadikoAtBlock(address, blockHeight);

  return {
    ststx_balance: wallet,
    defi_balance: zest + arkadiko,
    lp_balance: bitflow
  }
}

async function userInfoAtBlock(address, blockHeight) {
  // Cycle 81 boost
  const blockHeightStartCycle81 = 143913;
  const blockHeightEndCycle81 = blockHeightStartCycle81 + 2100;

  // Normal user info
  const userInfo = await userInfoAtBlockHelper(address, blockHeight);

  // End of cycle 81
  if (blockHeight == blockHeightEndCycle81) {
    const startUserInfo = await userInfoAtBlockHelper(address, blockHeightStartCycle81)

    const total = userInfo.ststx_balance + userInfo.defi_balance + userInfo.lp_balance;
    const totalStart = startUserInfo.ststx_balance + startUserInfo.defi_balance + startUserInfo.lp_balance;

    if (total >= totalStart) {
      // User gets 5x multiplier in cycle 81
      const blockDiff = blockHeightEndCycle81 - blockHeightStartCycle81;

      return {
        ststx_balance: userInfo.ststx_balance + totalStart * 5,
        defi_balance: userInfo.defi_balance,
        lp_balance: userInfo.lp_balance
      }
    }

  }

  return userInfo;
}

//
// Loop
//

async function updateAllPoints(blockHeight) {
  const addresses = await utils.readFile('points-addresses-6');
  const referrals = await utils.readFile('points-referrals-6');
  const aggregate = await utils.readFile('points-aggregate-6');

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

      const newPoints = userInfo.ststx_balance + userInfo.defi_balance * 1.5 + userInfo.lp_balance * 2.5;

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
  const lastBlockHeight = await utils.readFile('points-last-block-6');
  const currentBlockHeight = await utils.getBlockHeight();
  const nextBlockHeight = lastBlockHeight.last_block + 144;

  console.log("[3-aggregate] Next block:", nextBlockHeight, ", current block:", currentBlockHeight);

  if (currentBlockHeight > nextBlockHeight) {
    console.log("[3-aggregate] Updating points for block:", nextBlockHeight);

    const aggregate = await updateAllPoints(nextBlockHeight);
    console.log("[3-aggregate] Got users:", Object.keys(aggregate).length);

    await utils.writeFile('points-aggregate-6', aggregate)
    await utils.writeFile('points-last-block-6', { last_block: nextBlockHeight })
  }
};

// start();

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

exports.start = start;
