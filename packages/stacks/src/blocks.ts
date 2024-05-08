import { Block, NakamotoBlock } from '@stacks/blockchain-api-client';
import { TransactionEventSmartContractLog } from '@stacks/stacks-blockchain-api-types';
import { contracts } from './constants';
import { ParsedEvent, getContractEventsForBlock } from './contracts';
import { getTransactionsByBlockHash } from './transactions';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { Referral } from '@repo/database/src/models';

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

// TODO: this function
export function processBlockReferrals(events: ParsedEvent[]): Referral[] {
  // for (const event of events) {
  //   const logJson = cvToValue(hexToCV(event.contract_log.value.hex));

  //   // Deposit and mint stSTX
  //   if (event.contract_log.contract_id == coreContract && logJson.action.value == 'deposit') {
  //     const stacker = logJson.data.value.stacker.value;
  //     const referrer = logJson.data.value.referrer.value;
  //     const blockHeight = logJson.data.value['block-height'].value;

  //     if (referrer) {
  //       const referrerValue = referrer.value;

  //       if (!referrers[referrerValue]) {
  //         referrers[referrerValue] = [{ stacker: stacker, blockHeight: blockHeight }];
  //       } else {
  //         const existingStackers = referrers[referrerValue].filter(elem => elem.stacker == stacker);
  //         if (existingStackers.length == 0) {
  //           referrers[referrerValue] = referrers[referrerValue].concat([
  //             { stacker: stacker, blockHeight: blockHeight },
  //           ]);
  //         }
  //       }
  //     }
  //   }
  // }

  return [];
}
