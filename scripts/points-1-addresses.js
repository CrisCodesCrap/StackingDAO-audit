require('dotenv').config();
const tx = require('@stacks/transactions');
const utils = require('./utils.js');

//
// Constants
//

const coreContract = `${process.env.CONTRACT_ADDRESS}.stacking-dao-core-v1`;
const tokenContract = `${process.env.CONTRACT_ADDRESS}.ststx-token`;
const swap1Contract = `SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-1`;
const swap2Contract = `SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-2`;

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

function parseAllTransactionsForAddresses(allTransactions) {
  var addresses = [];

  for (const transaction of allTransactions) {
    if (transaction.tx_type == "contract_call" && transaction.contract_call.function_name == "add-liquidity") {
      addresses.push(transaction.sender_address);
    }
  }

  // Remove duplicates
  return [...new Set(addresses)]
}


//
// Main
//

async function start() {

  // Need to find all addresses that ever held stSTX:
  // 1) Deposited on StackingDAO (stSTX minted)
  // 2) Received stSTX from transfer (ex: swap in BitFlow)

  const currentBlockHeight = await utils.getBlockHeight();

  const coreContractEvents = await utils.getAllEvents(coreContract);
  const tokenContractEvents = await utils.getAllEvents(tokenContract);

  const swap1ContractTransactions = await utils.getAllTransactions(swap1Contract);
  const swap2ContractTransactions = await utils.getAllTransactions(swap2Contract);



  const allEvents = coreContractEvents.concat(tokenContractEvents);
  const addressesFromEvents = parseAllEventsForAddresses(allEvents);

  const allTransactions = swap1ContractTransactions.concat(swap2ContractTransactions);
  const addressesFromTransactions = parseAllTransactionsForAddresses(allTransactions);

  const addresses = [...new Set(addressesFromEvents.concat(addressesFromTransactions))]
  console.log("[1-addresses] Got addresses:", addresses.length);

  await utils.writeFile('points-addresses-4', {"addresses": addresses})



  // Referrals
  const referrers = parseAllEventsForReferrers(coreContractEvents);
  console.log("[2-referrals] Got referrers:", Object.keys(referrers).length);

  await utils.writeFile('points-referrals-4', referrers)

  await utils.writeFile('points-last-block-addresses-4', { last_block: currentBlockHeight })
};

// start();

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

exports.start = start;
