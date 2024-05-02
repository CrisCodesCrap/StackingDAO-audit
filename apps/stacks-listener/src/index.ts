import { StacksApiWebSocketClient, connectWebSocketClient } from "@stacks/blockchain-api-client";
import type { Block } from "@stacks/stacks-blockchain-api-types";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const queue = process.env.QUEUE_URL;
const sqs = new SQSClient();

let connection: StacksApiWebSocketClient | undefined;

connectWebSocketClient("wss://api.mainnet.hiro.so/").then(async (conn) => {
  connection = conn;
  await connection.subscribeBlocks(sendBlock);

  console.log("listening for confirmed blocks...");
});

async function sendBlock(block: Block) {
  console.log("Received block ", block.height);

  try {
    const response = await sqs.send(
      new SendMessageCommand({
        QueueUrl: queue,
        DelaySeconds: 10,
        MessageDeduplicationId: block.hash,
        MessageAttributes: {
          Publisher: {
            DataType: "String",
            StringValue: "stacks-listener",
          },
        },
        MessageBody: JSON.stringify(block),
      })
    );

    console.log(`Published message ${response.MessageId} to queue.`);
  } catch (e) {
    console.error("failed to put block on queue: ", block.hash);
  }
}

app.get("/health", (_: Request, res: Response) => {
  if (connection?.webSocket.OPEN) res.send("ok");
  else res.status(500).send("disconnected");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
