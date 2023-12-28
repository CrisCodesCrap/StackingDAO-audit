require('dotenv').config();
const request = require('request-promise');
const tx = require('@stacks/transactions');

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

function parseAllEvents(allEvents) {
  var parsedEvents = [];

  for (const event of allEvents) {
    if (event.event_type == "smart_contract_log") {

      // Core contract
      if (event.contract_log.contract_id == coreContract) {
        const logJson = tx.cvToValue(tx.hexToCV(event.contract_log.value.hex));

        if (logJson.action.value == "deposit") {
          const blockHeight = logJson.data.value["block-height"].value;
          const stacker = logJson.data.value.stacker.value;
          const amount = logJson.data.value.amount.value;
          const referrer = logJson.data.value.referrer.value;

          parsedEvents.push({
            action: "deposit",
            blockHeight: blockHeight,
            stacker: stacker,
            amount: amount,
            referrer: referrer
          })

        } else if (logJson.action.value == "withdraw") {
          const blockHeight = logJson.data.value["block-height"].value;
          const stacker = logJson.data.value.stacker.value;
          const amount = logJson.data.value.amount.value;

          parsedEvents.push({
            action: "withdraw",
            blockHeight: blockHeight,
            stacker: stacker,
            amount: amount,
          })
        }

      // Token contract
      } else if (event.contract_log.contract_id == tokenContract) {
        const logJson = tx.cvToValue(tx.hexToCV(event.contract_log.value.hex));

        if (logJson.action.value == "transfer") {
          const blockHeight = logJson.data.value["block-height"].value;
          const sender = logJson.data.value.sender.value;
          const recipient = logJson.data.value.recipient.value;
          const amount = logJson.data.value.amount.value;

          parsedEvents.push({
            action: "transfer",
            blockHeight: blockHeight,
            sender: sender,
            recipient: recipient,
            amount: amount
          })

        }

      }

      // TODO: Arkadiko vaults, DEX liquidity
    }
  }

  return parsedEvents;
}

//
// Calculate
//

function calculatePoints(parsedEvents) {
  const allStackers = getAllStackers(parsedEvents);
  var stackerPoints = {};

  for (const stacker of allStackers) {
    const filteredEvents = parsedEvents.filter(event => event.stacker == stacker || event.sender == stacker || event.recipient == stacker);
    const sortedEvents = filteredEvents.sort((a, b) => a.blockHeight - b.blockHeight);

    var points = 0;

    // TODO: need to know on which blocks to get points
    // TODO: loop over all user events and calculate points

  }

  return stackerPoints
}

function calculateReferrals(parsedEvents) {
  var referrers = {};
  for (const event of parsedEvents) {
    if (event.action == "deposit" && event.referrer) {
      if (referrers[event.referrer]) {
        var existing = referrers[event.referrer];
        existing.push(event.stacker);
        referrers[event.referrer] = existing;
      } else {
        referrers[event.referrer] = [event.stacker];
      }
    }
  }
  return referrers
}

function getAllStackers(parsedEvents) {
  var stackers = [];
  for (const event of parsedEvents) {
    if (event.stacker && !stackers.includes(event.stacker)) {
      stackers.push(event.stacker)
    } else if (event.recipient) {
      stackers.push(event.recipient)
    }
  }
  return stackers;
}

//
// Main
//

async function start() {
  const allEvents = await getAllEvents();
  const parsedEvents = parseAllEvents(allEvents);

  const points = calculatePoints(parsedEvents);
  const referrers = calculateReferrals(parsedEvents);

  // TODO: save points and referrers JSON
  console.log('# of deposits:', allEvents.length); // TODO: assumes it is all deposits
  console.log("Points:", points);
  console.log("# of Referrals:", referrers['[object Object]'].length);
};

start();
