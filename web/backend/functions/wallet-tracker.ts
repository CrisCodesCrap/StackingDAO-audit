import { Block, TransactionEventSmartContractLog } from '@stacks/stacks-blockchain-api-types';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { getTransactionsByBlockHash } from '@/backend/lib/stacks/transactions';
import { getContractEventsForBlock, ParsedEvent } from '@/backend/lib/stacks/contracts';
import { upsertWallets } from '@/backend/lib/db';
import { getAddressesStSTXBalance } from '@/backend/lib/stacks/accounts';
import { contracts } from '@/backend/lib/stacks/constants';
import * as sns from '@/backend/lib/sns';
import type { SNSEvent } from 'aws-lambda';

const TOPIC_ARN = process.env.SNS_TOPIC!;

// export async function track(event: SNSEvent, _: Context): Promise<void> {
export async function track(block: Block): Promise<void> {
  // for (const record of event.Records) {
  // 1. Parse block we received.
  // const block = JSON.parse(record.Sns.Message) as Block;

  // 2. Find all wallets that might contain or have contained stSTX.
  const result = await Promise.all([processBlockEvents(block), processBlockTransactions(block)]);

  const addresses = [...new Set(result.flat())];

  console.log('addresses found: ', addresses.length);
  // if (addresses.length == 0) continue;

  // 3. Get each address' stSTX balance and update our list.
  const wallets = await getAddressesStSTXBalance(block.hash, addresses);

  console.log(`stSTX balances found: ${wallets.length}/${addresses.length}`);
  // if (wallets.length == 0) continue;

  // 4. Write new wallets to db.
  const recordsWritten = await upsertWallets(wallets);

  console.log(`Updated or created ${recordsWritten} wallets`);

  // 5. Update anyone that wants to know about the wallets being updated.
  // const response = await sns.publish(
  //   TOPIC_ARN,
  //   JSON.stringify({ block_hash: block.hash, wallets: addresses })
  // );

  // console.log('Published message ', response.MessageId);
  // }
}

async function processBlockEvents(block: Block): Promise<string[]> {
  // Get latest events for the contracts we care about.
  const results = await Promise.all([
    getContractEventsForBlock(contracts.core, block.txs.length),
    getContractEventsForBlock(contracts.token, block.txs.length),
    getContractEventsForBlock(contracts.arkadiko, block.txs.length),
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

async function processBlockTransactions(block: Block): Promise<string[]> {
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
