import { Block } from '@stacks/stacks-blockchain-api-types';
import { upsertWallets } from '../lib/db';
import { userInfoAtBlock } from '../lib/stacks/user_info';
import { WalletUpdate } from '@web/db/models';
import { processBlockEvents, processBlockTransactions } from '../lib/stacks/blocks';

// export async function track(event: SNSEvent, _: Context): Promise<void> {
export async function updateWallets(block: Block): Promise<void> {
  // for (const record of event.Records) {
  // 1. Parse block we received.
  // const block = JSON.parse(record.Sns.Message) as Block;

  // 2. Find all wallets that might contain or have contained stSTX.
  const result = await Promise.all([processBlockEvents(block), processBlockTransactions(block)]);

  const addresses = [...new Set(result.flat())];

  console.log('addresses found: ', addresses.length);
  // if (addresses.length == 0) continue;

  // 3. Get each address' stSTX balance and update our list.

  const wallets: WalletUpdate[] = [];
  for (const wallet of wallets) {
    const balances = await userInfoAtBlock(wallet.address, block.height);

    wallets.push({
      address: wallet.address,
      currentBalance: (balances.total * 1_000_000).toString(),
    });
  }

  console.log(`stSTX balances found: ${wallets.length}/${addresses.length}`);
  // if (wallets.length == 0) continue;

  // 4. Write new wallets to db.
  const recordsWritten = await upsertWallets(wallets);

  console.log(`Updated or created ${recordsWritten}/${addresses.length} wallets`);

  // 5. Update anyone that wants to know about the wallets being updated.
  // const response = await sns.publish(
  //   TOPIC_ARN,
  //   JSON.stringify({ block_hash: block.hash, wallets: addresses })
  // );

  // console.log('Published message ', response.MessageId);
  // }
}
