import * as db from '../lib/db';

// export async function calculate(event: SNSEvent, _: Context): Promise<void> {
export async function updateLeaderboard(block_hash: string): Promise<void> {
  // for (const record of event.Records) {
  // 1. Parse addresses we received.
  // const block_hash = JSON.parse(record.Sns.Message) as string;

  // 3. Update leaderboard.
  console.log('updating leaderboard for block', block_hash);
  const newLeaderboard = await db.getTopDailyPointHolders();

  // 4. Write new leaderboard to db.
  console.log('writing new leaderboard to db');

  const size = Math.ceil(newLeaderboard.length / 50);
  const chunks = Array.from({ length: 50 }, (v, i) =>
    newLeaderboard.slice(i * size, i * size + size)
  );

  for (const chunk of chunks) {
    const recordsWritten = await db.updateLeaderboard(chunk);

    console.log(`Updated leaderboard with ${recordsWritten} new rows`);
  }
  // }
}
