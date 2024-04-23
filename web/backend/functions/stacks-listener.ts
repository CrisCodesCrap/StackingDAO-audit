import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import * as sns from '@/backend/lib/sns';

const TOPIC_ARN = process.env.SNS_TOPIC!;

async function subscribeToBlockEvents(): Promise<void> {
  // for testnet, replace with wss://api.testnet.hiro.so/
  const client = await connectWebSocketClient('wss://api.mainnet.hiro.so/');

  client.subscribeBlocks(block => processNewBlock(block.hash));
  console.log('listening for confirmed blocks...');
}

async function processNewBlock(block: string): Promise<void> {
  console.log('Received block ', block, 'emitting event');

  sns.publish(TOPIC_ARN, JSON.stringify(block));
}

subscribeToBlockEvents();
