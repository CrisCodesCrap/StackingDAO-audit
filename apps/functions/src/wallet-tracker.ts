import type { SQSEvent, Context } from "aws-lambda";
import { Block, TransactionEventSmartContractLog } from "@stacks/stacks-blockchain-api-types";
import { insertReferral, upsertWallets } from "@repo/database/src/actions";
import { userInfoAtBlock } from "@repo/stacks/src/user_info";
import { WalletUpdate } from "@repo/database/src/models";
import { processBlockEvents, processBlockReferrals, processBlockTransactions } from "@repo/stacks/src/blocks";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { BlocksApi, NakamotoBlock } from "@stacks/blockchain-api-client";
import { ParsedEvent, getContractEventsForBlock } from "@repo/stacks/src/contracts";
import { contracts } from "@repo/stacks/src/constants";
import { cvToValue, hexToCV } from "@stacks/transactions";

const REPLAY_COUNT = 10;
const updatesTopic = process.env.OUTGOING_SNS_TOPIC;
const sns = new SNSClient();
const blocks = new BlocksApi();

export async function updateWallets(event: SQSEvent, _: Context): Promise<void> {
  for (const record of event.Records) {
    const latest_block = (await JSON.parse(record.body)) as Block;

    const block_list = [];
    for (let block_height = latest_block.height - REPLAY_COUNT; block_height < latest_block.height; block_height++) {
      try {
        const block = await blocks.getBlockByHeight({ height: block_height });
        block_list.push(block);
      } catch (e) {
        console.log("failed to get block", block_height);
        continue;
      }
    }

    for (const block of [...block_list, latest_block]) {
      // Get latest events for the contracts we care about.
      const results = await Promise.all([
        getContractEventsForBlock(contracts.core, block.tx_count),
        getContractEventsForBlock(contracts.token, block.tx_count),
        getContractEventsForBlock(contracts.arkadiko, block.tx_count),
      ]);

      // Flatten results and filter only relevant events.
      const rawEvents = results
        .flat()
        .filter((e) => e.event_type === "smart_contract_log") as TransactionEventSmartContractLog[];

      const events = rawEvents
        .map((event) => ({
          contract_id: event.contract_log.contract_id,
          action: cvToValue(hexToCV(event.contract_log.value.hex)),
        }))
        .filter((value) => !!value.action) as ParsedEvent[];

      await updateWalletsForBlock(block, events);
      await updateReferrals(block, events);
    }
  }
}

export async function updateWalletsForBlock(block: NakamotoBlock, events: ParsedEvent[]): Promise<void> {
  // 1. Find all wallets that might contain or have contained stSTX.
  const result = await Promise.all([processBlockEvents(events), processBlockTransactions(block)]);

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

export async function updateReferrals(block: NakamotoBlock, events: ParsedEvent[]): Promise<void> {
  console.log(`Processing block referrals for ${block}`);

  const referrals = processBlockReferrals(events);

  const recordsWritten = await insertReferral(referrals);

  console.log(`Updated or created ${recordsWritten}/${referrals.length} wallets`);
}
