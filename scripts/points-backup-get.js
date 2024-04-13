require('dotenv').config();
const utils = require('./utils.js');
const fs = require('fs');


async function backupFile(backupFolder, fileName) {
  const fileResult = await utils.readFile(fileName);
  // console.log(fileResult);
  fs.writeFileSync("files/" + backupFolder + "/" + fileName + ".json", JSON.stringify(fileResult, undefined, 2));
}

//
// Main
//

async function start() {

  const backupFolder = "points-backup-2024-04-10"

  const fileNames = ['points-last-block-8', 'points-last-block-addresses-8', 'points-addresses-8', 'points-referrals-8', 'points-aggregate-8'];

  for (const fileName of fileNames) {
    await backupFile(backupFolder, fileName);
  }
};

start();
