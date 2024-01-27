require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils.js');
const fs = require('fs');

//
// Constants
//

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const tokenContract = `${process.env.CONTRACT_ADDRESS}.ststx-token`;

//
// Balance
//

async function getUserBalance(address) {
  try {
    const userInfo = await tx.callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "block-info-v1",
      functionName: "get-lp-balance-at-block",
      functionArgs: [
        tx.standardPrincipalCV(address),
        tx.uintCV(137115)
      ],
      senderAddress: process.env.CONTRACT_ADDRESS,
      network: utils.resolveNetwork()
    });

    const result = tx.cvToJSON(userInfo).value.value;
    return result;
  } catch (error) {
    // console.log("[3-aggregate] Fetch failed, retry in 5 seconds..", error);
    await new Promise(r => setTimeout(r, 10 * 1000));
    return await getUserBalance(address);
  }
}


//
// Parse
//

function parseAllEventsForAddresses(allEvents) {
  var addresses = [];

  for (const event of allEvents) {
    if (event.event_type == "smart_contract_log") {
      const logJson = tx.cvToValue(tx.hexToCV(event.contract_log.value.hex));

      // Transfer stSTX to Bitflow
      if (event.contract_log.contract_id == tokenContract && logJson && logJson.action && logJson.action.value == "transfer") {
        const sender = logJson.data.value.sender.value;
        const recipient = logJson.data.value.recipient.value;

        if (recipient == "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-1") {
          addresses.push(sender);
        }
      }

    }
  }

  // Remove duplicates
  return [...new Set(addresses)]
}

//
// Main
//

async function start() {


  // const tokenContractEvents = await utils.getAllEvents(tokenContract);
  // const addresses = parseAllEventsForAddresses(tokenContractEvents);
  // console.log("[1-addresses] Got addresses:", addresses.length);
  // await utils.writeFile('bitflow-lp-addresses', {"addresses": addresses})



  const addresses = await utils.readFile('bitflow-lp-addresses');

  var result = ""
  var counter = 0;
  for (let i = counter; i < addresses.addresses.length; i++) {
    const address = addresses.addresses[i];
    const balance = await getUserBalance(address);
    if (balance > 0) {
      const infoLine = address + "," + balance;
      result += infoLine + "\n";
      console.log(infoLine);
      fs.writeFileSync("files/bitflow-balances.csv", result);
    }

    console.log(counter + "/" + addresses.addresses.length);
    counter++;
  }

};

start();

