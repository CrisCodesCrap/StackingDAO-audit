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
const arkadikoVaultsContract = `SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-vaults-data-v1-1`;

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
        if (!stacker.includes(".")) {
          addresses.push(stacker);
        }
      }

      // Transfer stSTX
      if (event.contract_log.contract_id == tokenContract && logJson && logJson.action && logJson.action.value == "transfer") {
        const recipient = logJson.data.value.recipient.value;
        if (!recipient.includes(".")) {
          addresses.push(recipient);
        }
      }

      // Arkadiko migration
      if (event.contract_log.contract_id == arkadikoVaultsContract && logJson.action.value == "vaults-set") {
        const stacker = logJson.owner.value;
        if (!stacker.includes(".")) {
          addresses.push(stacker);
        }
      }

    }
  }

  // Remove duplicates
  return [...new Set(addresses)]
}

function parseAllEventsForReferrers(allEvents) {
  var referrers = {};
  var referrers2 = {};

  for (const event of allEvents) {
    if (event.event_type == "smart_contract_log") {
      const logJson = tx.cvToValue(tx.hexToCV(event.contract_log.value.hex));

      // Deposit and mint stSTX
      if (event.contract_log.contract_id == coreContract && logJson.action.value == "deposit") {
        const stacker = logJson.data.value.stacker.value;
        const referrer = logJson.data.value.referrer.value;
        const blockHeight = logJson.data.value['block-height'].value;

        if (referrer) {
          const referrerValue = referrer.value;

          if (blockHeight > 999999999) {

            if (!referrers[referrerValue]) {
              if (!referrers2[referrerValue]) {
                referrers2[referrerValue] = [stacker];
              } else {
                referrers2[referrerValue] = [...new Set(referrers2[referrerValue].concat([stacker]))];
              }
            }

          } else {
            if (!referrers[referrerValue]) {
              referrers[referrerValue] = [stacker];
            } else {
              referrers[referrerValue] = [...new Set(referrers[referrerValue].concat([stacker]))];
            }
          }
        }
      }
    }
  }

  return { referrers: referrers, referrers2: referrers2 };
}

function parseAllTransactionsForAddresses(allTransactions) {
  var addresses = [];

  for (const transaction of allTransactions) {
    if (transaction.tx_type == "contract_call" && transaction.contract_call.function_name == "add-liquidity") {
      const sender =  transaction.sender_address;
      if (!sender.includes(".")) {
        addresses.push(sender);
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

  // Need to find all addresses that ever held stSTX:
  // 1) Deposited on StackingDAO (stSTX minted)
  // 2) Received stSTX from transfer (ex: swap in BitFlow)

  const currentBlockHeight = await utils.getBlockHeight();

  const coreContractEvents = await utils.getAllEvents(coreContract);
  const tokenContractEvents = await utils.getAllEvents(tokenContract);
  const arkadikoContractEvents = await utils.getAllEvents(arkadikoVaultsContract);

  const swap1ContractTransactions = await utils.getAllTransactions(swap1Contract);
  const swap2ContractTransactions = await utils.getAllTransactions(swap2Contract);


  const allEvents = coreContractEvents.concat(tokenContractEvents).concat(arkadikoContractEvents);
  const addressesFromEvents = parseAllEventsForAddresses(allEvents);

  const allTransactions = swap1ContractTransactions.concat(swap2ContractTransactions);
  const addressesFromTransactions = parseAllTransactionsForAddresses(allTransactions);

  const addresses = [...new Set(addressesFromEvents.concat(addressesFromTransactions))]
  console.log("[1-addresses] Got addresses:", addresses.length);

  await utils.writeFile('points-addresses-10', {"addresses": addresses})



  // Referrals
  const referrers = parseAllEventsForReferrers(coreContractEvents);
  console.log("[2-referrals] Got referrers:", Object.keys(referrers.referrers).length);
  console.log("[2-referrals] Got referrers 2:", Object.keys(referrers.referrers2).length);

  await utils.writeFile('points-referrals-10', referrers.referrers)
  await utils.writeFile('points-referrals-2-10', referrers.referrers2)

  await utils.writeFile('points-last-block-addresses-10', { last_block: currentBlockHeight })
};

// start();

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

exports.start = start;
