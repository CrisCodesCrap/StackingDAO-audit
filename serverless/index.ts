import { StacksApiWebSocketClient, connectWebSocketClient } from '@stacks/blockchain-api-client';
import { Block } from '@stacks/stacks-blockchain-api-types';

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

let connection: StacksApiWebSocketClient | undefined;

connectWebSocketClient('wss://api.mainnet.hiro.so/').then(async conn => {
  connection = conn;
  await connection.subscribeBlocks(async (block: Block) => {
    console.log('Received block ', block.height);

    // await track(block);
    // await calculate(block.hash);
  });

  console.log('listening for confirmed blocks...');
});

app.get('/health', (_: Request, res: Response) => {
  res.send(connection?.webSocket.OPEN ? 'ok' : 'disconnected');
});

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
