import { StacksApiWebSocketClient, connectWebSocketClient } from '@stacks/blockchain-api-client';
import type { Block } from '@stacks/stacks-blockchain-api-types';

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

  // TODO: add 10 block buffer to avoid missed blocks
  });

  console.log('listening for confirmed blocks...');
});

app.get('/health', (_: Request, res: Response) => {
  if (connection?.webSocket.OPEN) res.send('ok');
  else res.status(500).send('disconnected');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
