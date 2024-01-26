require('dotenv').config();
const utils = require('./utils.js');
const tx = require('@stacks/transactions');
const fs = require('fs');

//
// Constants
//

const infoContract = `${process.env.CONTRACT_ADDRESS}.block-info-v1`;

//
// Contract calls
//

async function userInfoAtBlock(address, blockHeight) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: infoContract.split(".")[0],
      contractName: infoContract.split(".")[1],
      functionName: "get-user-ststx-at-block",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(blockHeight),
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value;
    return (result["lp-balance"].value + result["ststx-balance"].value) / 1000000;
  } catch (error) {
    console.log("Fetch failed, retry in 5 seconds..", error);
    await new Promise(r => setTimeout(r, 5 * 1000));
    return userInfoAtBlock(address, blockHeight);
  }
}

//
// Run
//

// Cycle 74 ended on bitcoin block 823450 = stacks block 133737
// Cycle 75 ended on bitcoin block 825550 = stacks block 135418
async function run() {
  const addresses = await utils.readFile('points-addresses');

  var result = "";
  var counter = 0;

  for (const address of addresses.addresses) {
    const balanceEndCycle74 = await userInfoAtBlock(address, 133737);
    const balanceEndCycle75 = await userInfoAtBlock(address, 135418);

    if (balanceEndCycle74 >= 100 && balanceEndCycle75 > 0) {

      const infoLine = address + ";" + balanceEndCycle74 + ";" + balanceEndCycle75;
      result += infoLine + "\n";
      console.log(infoLine);

      fs.writeFileSync("files/addresses-nft.csv", result);

    }

    console.log(counter + "/" + addresses.addresses.length);
    counter++;
  }
}

run();
