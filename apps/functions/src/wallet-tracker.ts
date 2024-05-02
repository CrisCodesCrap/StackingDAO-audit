import { SQSEvent, Context } from "aws-lambda";
import { Block } from "@stacks/stacks-blockchain-api-types";
import { upsertWallets } from "@repo/database/src/actions";
import { userInfoAtBlock } from "@repo/stacks/src/user_info";
import { WalletUpdate } from "@repo/database/src/models";
import { processBlockEvents, processBlockTransactions } from "@repo/stacks/src/blocks";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { BlocksApi } from "@stacks/blockchain-api-client";

const REPLAY_COUNT = 10;
const updatesTopic = process.env.OUTGOING_SNS_TOPIC;
const sns = new SNSClient();
const blocks = new BlocksApi();

export async function updateWallets(event: SQSEvent, _: Context): Promise<void> {
  for (const record of event.Records) {
    const latest_block = (await JSON.parse(record.body)) as Block;

    // TODO: reduce replay count by difference with last processed block (stored in db)
    // TODO: read from db instead of from event
    // TODO: write blocks to db after we process them or when we receive them instead of sending to SQS topic

    for (let block_height = latest_block.height - REPLAY_COUNT; block_height < latest_block.height; block_height++) {
      try {
        const block = await blocks.getBlockByHeight({ height: block_height });
        await updateWalletsForBlock(block);
      } catch (e) {
        console.log("failed for block", block_height);
        continue;
      }
    }

    await updateWalletsForBlock(latest_block);
  }
}

export async function updateWalletsForBlock(block: Block): Promise<void> {
  // 1. Find all wallets that might contain or have contained stSTX.
  const result = await Promise.all([processBlockEvents(block), processBlockTransactions(block)]);

  const addresses = [...new Set(result.flat())];

  console.log("addresses found: ", addresses.length);
  if (addresses.length == 0) return;

  // 2. Get each address' stSTX balance and update our list.

  const wallets: WalletUpdate[] = [];
  for (const wallet of wallets) {
    const balances = await userInfoAtBlock(wallet.address, block.height);

    wallets.push({
      address: wallet.address,
      currentBalance: (balances.total * 1_000_000).toString(),
    });
  }

  console.log(`stSTX balances found: ${wallets.length}/${addresses.length}`);
  if (wallets.length == 0) return;

  // 3. Write new wallets to db.
  const recordsWritten = await upsertWallets(wallets);

  console.log(`Updated or created ${recordsWritten}/${addresses.length} wallets`);

  // 4. Update anyone that wants to know about the wallets being updated.
  const response = await sns.send(
    new PublishCommand({
      TopicArn: updatesTopic,
      Message: block.hash,
    })
  );

  console.log(`Published message ${response.MessageId} to topic.`);
}
