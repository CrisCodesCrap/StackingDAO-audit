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

  const backupFolder = "points-backup-2024-03-20"

  const fileNames = ['points-last-block-4', 'points-last-block-addresses-4', 'points-addresses-4', 'points-referrals-4', 'points-aggregate-4'];

  for (const fileName of fileNames) {
    await backupFile(backupFolder, fileName);
  }
};

start();
