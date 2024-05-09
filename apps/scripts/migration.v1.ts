import * as db from "@repo/database/src/actions";
import { NewPointsRecord, WalletUpdate } from "@repo/database/src/models";
import { BlocksApi } from "@stacks/blockchain-api-client";

type AggregateFile = Record<string, { user_points: number; referral_points: number }>;

const url = "https://stackingdao-points.s3.amazonaws.com";
const blocks = new BlocksApi();
const chunkSize = 50;

export async function migrate(url: string): Promise<void> {
  // 1. Fetch the latest points aggregate and other info.
  const aggregateFile = await fetch(url + "/points-aggregate-10.json");
  const aggregate = (await aggregateFile.json()) as AggregateFile;

  const lastBlockFile = await fetch(url + "/points-last-block-10.json");
  const lastBlock = (await lastBlockFile.json()).last_block as string;
  const block = await blocks.getBlock({ heightOrHash: lastBlock });

  console.log(block);
  if (1 == 1) return;

  // 2. Create a zero-balance wallet for every address found in the aggregate.
  //    note: This works due to the fact that the current balance is only
  //          required for calculating booster points after instantiation.
  console.log("creating new wallets");
  const addresses = Object.keys(aggregate);
  const wallets = addresses.map<WalletUpdate>((address) => ({ address }));
  const walletsCreated = await db.insertNewWallets(wallets);

  console.log(`Created ${walletsCreated} new wallets`);

  // 3. Add a "migration" record to db with their current points total.
  const points = Object.entries(aggregate).map<NewPointsRecord>(([address, totals]) => ({
    wallet: address,
    source: "migration",
    amount: Math.ceil(totals.user_points),
    block: block.hash,
  }));

  let totalPointsWritten = 0;
  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);

    for (const record of chunk) {
      const pointsCreated = await db.addPointRecords({
        wallet: record.wallet,
        source: "migration",
        amount: Math.ceil(record.amount),
        block: record.block,
        multiplier: 1,
      });

      totalPointsWritten += pointsCreated;
    }
    console.log(`Added ${totalPointsWritten}/${points.length} "migration" records`);
  }

  // 4. Add a "referrals" record to db with their current referral totals.
  const referrals = Object.entries(aggregate).map<NewPointsRecord>(([address, totals]) => ({
    wallet: address,
    source: "referral",
    amount: Math.ceil(totals.referral_points),
    block: block.hash,
  }));

  let totalReferralsWritten = 0;
  for (let i = 0; i < referrals.length; i += chunkSize) {
    const chunk = referrals.slice(i, i + chunkSize);

    for (const record of chunk) {
      const referralsCreated = await db.addPointRecords({
        wallet: record.wallet,
        source: "referral",
        amount: Math.ceil(record.amount),
        block: record.block,
        multiplier: 1,
      });

      totalReferralsWritten += referralsCreated;
    }

    console.log(`Added ${totalReferralsWritten}/${referrals.length} "migration" records`);
  }
}

// migrate(url);
