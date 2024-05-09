import { BlocksApi, InfoApi } from "@stacks/blockchain-api-client";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const info = new InfoApi();
const queue = process.env.QUEUE_URL;
const sqs = new SQSClient();
const blocks = new BlocksApi();

// Warning: this does NOT recalculate points, only wallets, balances, and referrals
//          points should be done using a different script
export async function migrate(starting_block_height: number): Promise<void> {
  const coreInfo = await info.getCoreApiInfo();

  for (let block_height = starting_block_height; block_height <= coreInfo.stacks_tip_height; block_height++) {
    const block = await blocks.getBlock({ heightOrHash: block_height });

    const response = await sqs.send(
      new SendMessageCommand({
        QueueUrl: queue,
        MessageDeduplicationId: block.hash,
        MessageGroupId: "migration.v2",
        MessageAttributes: {
          Publisher: {
            DataType: "String",
            StringValue: "migration.v2",
          },
        },
        MessageBody: JSON.stringify(block),
      })
    );

    console.log(`Published message ${response.MessageId} to queue.`);
  }
}

migrate(149416);
