require('dotenv').config();
const utils = require('./utils.js');
const fs = require('fs');


//
// Main
//

async function start() {

  const backupFolder = "points-backup-2024-02-26"

  const fileNames = ['points-last-block-3', 'points-last-block-addresses-3', 'points-addresses-3', 'points-referrals-3', 'points-aggregate-3'];

  for (const fileName of fileNames) {

    const data = fs.readFileSync("files/" + backupFolder + "/" + fileName + ".json");
    const json = JSON.parse(data);

    const writeResult = await utils.writeFile(fileName.replace("-3", "-8"), json)
    console.log("writeResult", writeResult);
  }
};

start();
