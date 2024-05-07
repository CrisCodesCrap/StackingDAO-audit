import { Block, NakamotoBlock } from '@stacks/blockchain-api-client';
import { TransactionEventSmartContractLog } from '@stacks/stacks-blockchain-api-types';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { contracts } from './constants';
import { ParsedEvent, getContractEventsForBlock } from './contracts';
import { getTransactionsByBlockHash } from './transactions';

export async function processBlockEvents(block: NakamotoBlock): Promise<string[]> {
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
