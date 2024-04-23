import functions from '@google-cloud/functions-framework';
import type { SNSEvent } from 'aws-lambda';
import * as wallet from './backend/functions/wallet-tracker';
// import * as leaderboard from './backend/functions/leaderboard';

export const walletTracker: functions.CloudEventFunction<SNSEvent> = async event => {
  if (!event.data) throw new Error('no block was passed');

  // await wallet.track(event.data);
  console.log(event.data);
};

// functions.cloudEvent<SNSEvent>('walletTracker', async event => {
//   if (!event.data) throw new Error('no block was passed');

//   // await wallet.track(event.data);
//   console.log(event.data);
// });

// functions.cloudEvent<SNSEvent>('leaderboardUpdater', async event => {
//   if (!event.data) throw new Error('no wallets were passed');

//   await leaderboard.calculate(event.data);
// });
