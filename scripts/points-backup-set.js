require('dotenv').config();
const utils = require('./utils.js');
const fs = require('fs');


//
// Main
//

async function start() {

  const backupFolder = "points-backup-2024-04-10"

  const fileNames = ['points-last-block-8', 'points-last-block-addresses-8', 'points-addresses-8', 'points-referrals-8', 'points-aggregate-8'];

  for (const fileName of fileNames) {

    const data = fs.readFileSync("files/" + backupFolder + "/" + fileName + ".json");
    const json = JSON.parse(data);

    const writeResult = await utils.writeFile(fileName.replace("-8", "-11"), json)
    console.log("writeResult", writeResult);
  }
};

start();
