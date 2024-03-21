require('dotenv').config();
const utils = require('./utils.js');
const fs = require('fs');


//
// Main
//

async function start() {

  const backupFolder = "points-backup-2024-03-20"

  const fileNames = ['points-last-block-4', 'points-last-block-addresses-4', 'points-addresses-4', 'points-referrals-4', 'points-aggregate-4'];

  for (const fileName of fileNames) {

    const data = fs.readFileSync("files/" + backupFolder + "/" + fileName + ".json");
    const json = JSON.parse(data);

    const writeResult = await utils.writeFile(fileName.replace("-4", "-5"), json)
    console.log("writeResult", writeResult);
  }
};

start();
