require("dotenv").config();
const tx = require("@stacks/transactions");
const utils = require("./utils.js");

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
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork(),
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise((r) => setTimeout(r, 2 * 1000));
    return await userWalletAtBlock(address, blockHeight);
  }
}

async function userBitflowAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: pointsContract.split(".")[0],
      contractName: pointsContract.split(".")[1],
      functionName: "get-user-bitflow",
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork(),
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise((r) => setTimeout(r, 2 * 1000));
    return await userBitflowAtBlock(address, blockHeight);
  }
}

async function userBitflowLpAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v10",
      functionName: "get-user-bitflow",
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork(),
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise((r) => setTimeout(r, 2 * 1000));
    return await userBitflowLpAtBlock(address, blockHeight);
  }
}

async function userZestAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v9",
      functionName: "get-user-zest",
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork(),
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise((r) => setTimeout(r, 2 * 1000));
    return await userZestAtBlock(address, blockHeight);
  }
}

async function userArkadikoAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v6",
      functionName: "get-user-arkadiko",
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork(),
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise((r) => setTimeout(r, 2 * 1000));
    return await userArkadikoAtBlock(address, blockHeight);
  }
}

async function userVelarAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v8",
      functionName: "get-user-velar",
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork(),
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise((r) => setTimeout(r, 2 * 1000));
    return await userVelarAtBlock(address, blockHeight);
  }
}

async function userHermeticaAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: "block-info-v11",
      functionName: "get-user-hermetica",
      functionArgs: [tx.standardPrincipalCV(address), tx.uintCV(blockHeight)],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork(),
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result / 1000000;
  } catch (error) {
    console.log("[3-aggregate] Fetch failed, retry in 2 seconds..", error);
    await new Promise((r) => setTimeout(r, 2 * 1000));
    return await userHermeticaAtBlock(address, blockHeight);
  }
}

async function userInfoAtBlock(address, blockHeight) {
  const [wallet, bitflow, zest, arkadiko, velar, hermetica] = await Promise.all([
    userWalletAtBlock(address, blockHeight),
    userBitflowAtBlock(address, blockHeight),
    userZestAtBlock(address, blockHeight),
    userArkadikoAtBlock(address, blockHeight),
    userVelarAtBlock(address, blockHeight),
    userHermeticaAtBlock(address, blockHeight),
  ]);

  return {
    ststx_balance: wallet,
    defi_balance: zest + arkadiko + velar + hermetica,
    lp_balance: bitflow,
  };
}

async function userInfoAtBlockForBoost(address, blockHeight) {
  const [wallet, bitflow, zest, arkadiko, velar, hermetica] = await Promise.all([
    userWalletAtBlock(address, blockHeight),
    userBitflowLpAtBlock(address, blockHeight),
    userZestAtBlock(address, blockHeight),
    userArkadikoAtBlock(address, blockHeight),
    userVelarAtBlock(address, blockHeight),
    userHermeticaAtBlock(address, blockHeight),
  ]);

  return wallet + zest + arkadiko + velar + hermetica + bitflow / 2;
}

//
// Loop
//

async function updateAllPoints(blockHeight) {
  const [addresses, referrals, aggregate] = await Promise.all([
    utils.readFile("points-addresses-11"),
    utils.readFile("points-referrals-11"),
    utils.readFile("points-aggregate-11"),
  ]);

  console.log("[3-aggregate] Got files from S3");

  // Cycle 81 - 5x boost
  const shouldApplyBoost1 = blockHeight >= 143630 && blockHeight <= 143630 + 2100;
  // Nakamoto - 20x boost
  const shouldApplyBoost2 = blockHeight >= 147290 && blockHeight <= 147290 + 2100;

  //
  // 0. From flat addresses array to chuncked array
  //
  const perChunk = 50;
  const addressesChunks = addresses.addresses.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  console.log("[3-aggregate] Created chunks");

  //
  // 1. Update user points
  //
  var counter = 0;
  for (const addressChunk of addressesChunks) {
    const allPromise = await Promise.all(addressChunk.map((address) => userInfoAtBlock(address, blockHeight)));

    let allBoostStartPromise = undefined;
    let allBoostEndPromise = undefined;
    if (shouldApplyBoost1) {
      allBoostStartPromise = await Promise.all(addressChunk.map((address) => userInfoAtBlockForBoost(address, 143630)));
      allBoostEndPromise = await Promise.all(
        addressChunk.map((address) => userInfoAtBlockForBoost(address, blockHeight))
      );
    } else if (shouldApplyBoost2) {
      allBoostStartPromise = await Promise.all(addressChunk.map((address) => userInfoAtBlockForBoost(address, 147290)));
      allBoostEndPromise = await Promise.all(
        addressChunk.map((address) => userInfoAtBlockForBoost(address, blockHeight))
      );
    }

    for (const address of addressChunk) {
      const addressIndex = addressChunk.indexOf(address);
      const userInfo = allPromise[addressIndex];

      const newPoints = userInfo.ststx_balance + userInfo.defi_balance * 1.5 + userInfo.lp_balance * 2.5;

      // Boosts
      var boostPoints1 = aggregate[address] ? aggregate[address].boost_points_1 : 0;
      if (shouldApplyBoost1) {
        const startAmount = allBoostStartPromise[addressIndex];
        const endAmount = allBoostEndPromise[addressIndex];

        if (endAmount > startAmount) {
          boostPoints1 = (endAmount - startAmount) * 5;
        } else {
          boostPoints1 = 0;
        }
      }

      var boostPoints2 = aggregate[address] ? aggregate[address].boost_points_2 : 0;
      if (shouldApplyBoost2) {
        const startAmount = allBoostStartPromise[addressIndex];
        const endAmount = allBoostEndPromise[addressIndex];

        if (endAmount > startAmount) {
          boostPoints2 = (endAmount - startAmount) * 20;
        } else {
          boostPoints2 = 0;
        }
      }

      if (!aggregate[address]) {
        aggregate[address] = {
          user_points: newPoints,
          referral_points: 0,
          boost_points_1: boostPoints1, // 5x
          boost_points_2: boostPoints2, // Nakamoto 20x
          boost_points_3: 0, // Nakamoto referral 2x
          new_points: newPoints,
        };
      } else {
        aggregate[address] = {
          user_points: aggregate[address].user_points + newPoints,
          referral_points: aggregate[address].referral_points,
          boost_points_1: boostPoints1,
          boost_points_2: boostPoints2,
          boost_points_3: aggregate[address].boost_points_3,
          new_points: newPoints,
        };
      }
    }

    console.log("[3-aggregate] Progress:", counter, "/", addressesChunks.length);
    counter++;
  }

  //
  // 2. Update referral points
  //

  for (const address of Object.keys(referrals)) {
    var newReferralPoints = 0;
    var newBoostPoints = 0;

    for (const referralInfo of referrals[address]) {
      const referredUser = referralInfo.stacker;
      const blockHeight = referralInfo.blockHeight;

      const referredUserNewPoints = aggregate[referredUser].new_points;
      newReferralPoints += referredUserNewPoints * 0.1;

      const applyBoost = shouldApplyBoost2 && blockHeight >= 147290 && blockHeight <= 147290 + 2100;
      if (applyBoost) {
        newBoostPoints += referredUserNewPoints * 0.1;
      }
    }

    if (!aggregate[address]) {
      aggregate[address] = {
        user_points: 0,
        boost_points_1: 0,
        boost_points_2: 0,
        boost_points_3: newBoostPoints,
        referral_points: newReferralPoints,
        new_points: 0,
      };
    } else {
      aggregate[address] = {
        user_points: aggregate[address].user_points,
        referral_points: aggregate[address].referral_points + newReferralPoints,
        boost_points_1: aggregate[address].boost_points_1,
        boost_points_2: aggregate[address].boost_points_2,
        boost_points_3: aggregate[address].boost_points_3 + newBoostPoints,
        new_points: aggregate[address].new_points,
      };
    }
  }

  return aggregate;
}

//
// Main
//

async function start() {
  const lastBlockHeight = await utils.readFile("points-last-block-11");
  const currentBlockHeight = await utils.getBlockHeight();
  const nextBlockHeight = lastBlockHeight.last_block + 144;

  console.log("[3-aggregate] Next block:", nextBlockHeight, ", current block:", currentBlockHeight);

  if (currentBlockHeight > nextBlockHeight) {
    console.log("[3-aggregate] Updating points for block:", nextBlockHeight);

    const aggregate = await updateAllPoints(nextBlockHeight);
    console.log("[3-aggregate] Got users:", Object.keys(aggregate).length);

    await utils.writeFile("points-aggregate-11", aggregate);
    await utils.writeFile("points-last-block-11", { last_block: nextBlockHeight });
  }
}

// start();

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

exports.start = start;
