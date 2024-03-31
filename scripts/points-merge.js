// Merge points-aggregate-7.json with points-aggregate-7-real.json (local files)
// and points-addresses-7-arka.json with points-addresses-7.json

require('dotenv').config();
const utils = require('./utils.js');

async function start() {
  // Merge addresses
  const arkaAddresses = await utils.readFile('points-addresses-7-arka');
  const allAddresses = await utils.readFile('points-addresses-7');
  const addresses = [...new Set(allAddresses['addresses'].concat(arkaAddresses['addresses']))];
  await utils.writeFile('points-addresses-7-all', {"addresses": addresses})

  // Merge points
  const arkaPoints = await utils.readFile('points-aggregate-7-arka');
  let points = await utils.readFile('points-aggregate-7-real');
  await utils.asyncForEach(Object.keys(arkaPoints), async (entry) => {
    if (points[entry]) {
      points[entry] = {
        "user_points": points[entry]['user_points'] + arkaPoints[entry]['user_points'],
        "referral_points": points[entry]['referral_points'] + arkaPoints[entry]['referral_points']
      }
    } else {
      points[entry] = {
        "user_points": arkaPoints[entry]['user_points'],
        "referral_points": arkaPoints[entry]['referral_points']
      }
    }
  });
  await utils.writeFile('points-aggregate-7-all', points);
}

start();
