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

  const backupFolder = "points-backup-2024-02-xx"

  const fileNames = ['points-last-block-3', 'points-last-block-addresses-3', 'points-addresses-3', 'points-referrals-3', 'points-aggregate-3'];

  for (const fileName of fileNames) {
    await backupFile(backupFolder, fileName);
  }
};

start();
