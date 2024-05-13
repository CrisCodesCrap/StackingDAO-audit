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

  const backupFolder = "points-backup-2024-05-13"

  const fileNames = ['points-last-block-11', 'points-last-block-addresses-11', 'points-addresses-11', 'points-referrals-11', 'points-aggregate-11'];

  for (const fileName of fileNames) {
    await backupFile(backupFolder, fileName);
  }
};

start();
