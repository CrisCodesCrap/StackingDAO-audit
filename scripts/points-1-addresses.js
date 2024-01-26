require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils.js');

//
// Constants
//

const coreContract = `${process.env.CONTRACT_ADDRESS}.stacking-dao-core-v1`;
const tokenContract = `${process.env.CONTRACT_ADDRESS}.ststx-token`;

//
// Parse
//

function parseAllEventsForAddresses(allEvents) {
  var addresses = [];

  for (const event of allEvents) {
    if (event.event_type == "smart_contract_log") {
      const logJson = tx.cvToValue(tx.hexToCV(event.contract_log.value.hex));

      // Deposit and mint stSTX
      if (event.contract_log.contract_id == coreContract && logJson.action.value == "deposit") {
        const stacker = logJson.data.value.stacker.value;
        addresses.push(stacker);
      }

      // Transfer stSTX
      if (event.contract_log.contract_id == tokenContract && logJson && logJson.action && logJson.action.value == "transfer") {
        const recipient = logJson.data.value.recipient.value;
        if (!recipient.includes(".")) {
          addresses.push(recipient);
        }
      }

    }
  }

  // Remove duplicates
  return [...new Set(addresses)]
}

function parseAllEventsForReferrers(allEvents) {
  var referrers = {};

  for (const event of allEvents) {
    if (event.event_type == "smart_contract_log") {
      const logJson = tx.cvToValue(tx.hexToCV(event.contract_log.value.hex));

      // Deposit and mint stSTX
      if (event.contract_log.contract_id == coreContract && logJson.action.value == "deposit") {
        const stacker = logJson.data.value.stacker.value;
        const referrer = logJson.data.value.referrer.value;

        if (referrer) {
          const referrerValue = referrer.value;
          if (!referrers[referrerValue]) {
            referrers[referrerValue] = [stacker];
          } else {
            referrers[referrerValue] = [...new Set(referrers[referrerValue].concat([stacker]))];
          }
        }
      }
    }
  }

  return referrers;
}

//
// Main
//

async function start() {

  // Need to find all addresses that ever held stSTX:
  // 1) Deposited on StackingDAO (stSTX minted)
  // 2) Received stSTX from transfer (ex: swap in BitFlow)

  const coreContractEvents = await utils.getAllEvents(coreContract);
  const tokenContractEvents = await utils.getAllEvents(tokenContract);

  const allEvents = coreContractEvents.concat(tokenContractEvents);
  const addresses = parseAllEventsForAddresses(allEvents);
  console.log("[1-addresses] Got addresses:", addresses.length);

  await utils.writeFile('points-addresses', {"addresses": addresses})

  // Referrals
  const referrers = parseAllEventsForReferrers(coreContractEvents);
  console.log("[2-referrals] Got referrers:", Object.keys(referrers).length);

  await utils.writeFile('points-referrals', referrers)
};

// start();

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

exports.start = start;
