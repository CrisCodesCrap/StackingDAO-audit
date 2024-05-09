import { BlocksApi, NakamotoBlock, TransactionsApi } from '@stacks/blockchain-api-client';
import { contracts } from './constants';
import { ParsedEvent, getContractEventsForBlock } from './contracts';
import { NewReferral, Referral } from '@repo/database/src/models';
import { Transaction, TransactionEventSmartContractLog } from '@stacks/stacks-blockchain-api-types';
import { cvToValue, hexToCV } from '@stacks/transactions';

const blocks = new BlocksApi();
const transactions = new TransactionsApi();

interface DetailedBlock {
  block: NakamotoBlock;
  events: ParsedEvent[];
  addresses: string[];
}

export async function getPreviousBlocks(
  latest_block: number,
  limit: number
): Promise<DetailedBlock[]> {
  const block_list: DetailedBlock[] = [];
  for (let block_height = latest_block - limit; block_height <= latest_block; block_height++) {
    try {
      const block = await blocks.getBlock({ heightOrHash: block_height });

      // Get latest events for the contracts we care about.
      const results = await Promise.all([
        getContractEventsForBlock(contracts.core, block.tx_count),
        getContractEventsForBlock(contracts.token, block.tx_count),
        getContractEventsForBlock(contracts.arkadiko, block.tx_count),
      ]);

      // Flatten results and filter only relevant events.
      const rawEvents = results
        .flat()
        .filter(e => e.event_type === 'smart_contract_log') as TransactionEventSmartContractLog[];

      const events = rawEvents
        .map(event => ({
          contract_id: event.contract_log.contract_id,
          action: cvToValue(hexToCV(event.contract_log.value.hex)),
        }))
        .filter(value => !!value.action) as ParsedEvent[];

      // Find all wallets that might contain or have contained stSTX.
      const result = await Promise.all([
        processBlockEvents(events),
        processBlockTransactions(block),
      ]);

      const addresses = [...new Set(result.flat())];

      console.log('addresses found: ', addresses.length);

      block_list.push({ block, events, addresses });
    } catch (e) {
      console.log('failed to get block', block_height);
      continue;
    }
  }

  return block_list.reverse();
}

export async function getTransactionsByBlockHash(hash: string): Promise<Transaction[]> {
  let allRecords: Transaction[] = [];
  let offset = 0;
  let nextPageExists = true;

  try {
    while (nextPageExists) {
      const data = await transactions.getTransactionsByBlockHash({
        blockHash: hash,
        limit: 200,
        offset,
      });

      allRecords = allRecords.concat(data.results as Transaction[]);
      offset += data.results.length;
      nextPageExists = offset < data.total;
    }
  } catch (e) {
    console.error(e);
  }

  return allRecords;
}

export async function processBlockEvents(events: ParsedEvent[]): Promise<string[]> {
  // Find all the addresses that might hold stSTX as a result of this block.
  const addresses: string[] = [];

  for (const event of events) {
    switch (event.contract_id) {
      // Deposit and mint stSTX
      case contracts.core:
        if (event.action.action?.value === 'deposit')
          addresses.push(event.action.data?.value.stacker?.value ?? '.');
        break;
      // Transfer stSTX
      case contracts.token:
        if (event.action.action?.value === 'transfer')
          addresses.push(event.action.data?.value.recipient?.value ?? '.');
        break;
      // Arkadiko migration
      case contracts.arkadiko:
        if (event.action.action?.value === 'vaults-set')
          addresses.push(event.action.owner?.value ?? '.');
        break;
    }
  }

  return addresses.filter(address => !address.includes('.'));
}

export async function processBlockTransactions(block: NakamotoBlock): Promise<string[]> {
  // Get more details about all the transactions in the current block.
  const txs = await getTransactionsByBlockHash(block.hash);

  const addresses = txs
    // Filter only contract calls relating to swapping stSTX and get the sender_address.
    .filter(
      tx =>
        tx.tx_type === 'contract_call' &&
        tx.contract_call.function_name === 'add-liquidity' &&
        [contracts.swap1, contracts.swap2].includes(tx.contract_call.contract_id)
    )
    .map(contractCall => contractCall.sender_address)
    // Filter out contract addresses.
    .filter(address => !address.includes('.'));

  return addresses;
}

export function processBlockReferrals(block_height: number, events: ParsedEvent[]): NewReferral[] {
  const referrals: NewReferral[] = [];

  for (const { contract_id, action: event } of events) {
    // Deposit and mint stSTX
    if (contract_id == contracts.core && event.action?.value === 'deposit') {
      const stacker = event.data?.value.stacker;
      const referrer = event.data?.value.referrer;
      if (!referrer || !stacker) continue;

      referrals.push({
        referrer: referrer.value,
        stacker: stacker?.value,
        blockHeight: block_height,
      });
    }
  }

  return referrals;
}
