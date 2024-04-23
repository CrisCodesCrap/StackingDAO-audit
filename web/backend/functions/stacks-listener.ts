import * as sns from '@/backend/lib/sns';

import { io } from 'socket.io-client';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { Block } from '@stacks/stacks-blockchain-api-types';
import { track } from './wallet-tracker';
import { calculate } from './leaderboard';

// const TOPIC_ARN = process.env.SNS_TOPIC!;
const socketUrl = 'https://api.mainnet.hiro.so/';

async function subscribeToBlockEvents(): Promise<void> {
  const socket = io(socketUrl, { reconnection: true });
  const sc = new StacksApiSocketClient(socket);

  sc.subscribeBlocks(processNewBlock);
  console.log('listening for confirmed blocks...');
}

async function processNewBlock(block: Block): Promise<void> {
  console.log('Received block ', block, 'emitting event');
  // sns.publish(TOPIC_ARN, JSON.stringify(block));
  let start = Date.now();

  await track(block);

  await calculate(block.hash);

  const timeTaken = Date.now() - start;
  console.log('Total time taken : ' + timeTaken + ' milliseconds');
}

subscribeToBlockEvents();
