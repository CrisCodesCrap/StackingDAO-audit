require('dotenv').config();
const request = require('request-promise');
const tx = require('@stacks/transactions');
const fs = require('fs');

//
// Constants
//

const baseApi = process.env.API_SERVER;
const coreContract = `${process.env.CONTRACT_ADDRESS}.stacking-dao-core-v1`;
const tokenContract = `${process.env.CONTRACT_ADDRESS}.ststx-token`;

//
// Get all events
//

async function getAllEvents() {
  var allEvents = [];

  var offset = 0;
  var events = await getEvents(offset);
  allEvents = allEvents.concat(events);

  while (events.length > 0) {
    offset += 50;
    events = await getEvents(offset);
    allEvents = allEvents.concat(events);
  }
  return allEvents;
}

async function getEvents(offset) {
  const url = `${baseApi}/extended/v1/contract/${coreContract}/events?limit=50&unanchored=false&offset=${offset}`;
  const result = await request(url, { json: true });
  return result.results;
}

//
// Parse
//

function parseAddresses(allEvents) {
  var addresses = {};

  for (const event of allEvents) {
    if (event.event_type == "smart_contract_log") {

      // Core contract
      if (event.contract_log.contract_id == coreContract) {
        const logJson = tx.cvToValue(tx.hexToCV(event.contract_log.value.hex));

        if (logJson.action.value == "deposit") {
          const stacker = logJson.data.value.stacker.value;
          const amount = logJson.data.value.amount.value;

          if (!addresses[stacker]) {
            addresses[stacker] = amount;
          }
        }
      }
    }
  }

  return addresses;
}

//
// Main
//

async function start() {
  const allEvents = await getAllEvents();
  const addrs = parseAddresses(allEvents);

  try {
    fs.writeFileSync('files/stackingdao-addresses.txt', Object.keys(addrs).join(',\n'));
  } catch (err) {
    console.error(err);
  }
};

start();
