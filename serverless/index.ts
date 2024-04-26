import { StacksApiWebSocketClient, connectWebSocketClient } from '@stacks/blockchain-api-client';
import { Block } from '@stacks/stacks-blockchain-api-types';

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { updateLeaderboard } from './functions/leaderboard';
import { updateWallets } from './functions/wallet-tracker';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

let connection: StacksApiWebSocketClient | undefined;

connectWebSocketClient('wss://api.mainnet.hiro.so/').then(async conn => {
  connection = conn;
  await connection.subscribeBlocks(async (block: Block) => {
    console.log('Received block ', block.height);

    // await updateWallets(block); // await track(block);
    // await updateLeaderboard(block.hash); // await calculate(block.hash);
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
