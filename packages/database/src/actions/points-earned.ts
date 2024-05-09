'use server';

import { sql } from 'drizzle-orm';
import { NewPointsRecord, Leaderboard, LeaderboardRank } from '../models';
import { pointsEarned } from '../schema';
import { db } from '../drizzle';

export async function addPointRecords(...records: NewPointsRecord[]): Promise<number> {
  const result = await db.insert(pointsEarned).values(records).onConflictDoNothing();

  return result.rowCount;
}

export async function upsertCampaignPoints(...records: NewPointsRecord[]): Promise<number> {
  const result = await db
    .insert(pointsEarned)
    .values(records)
    .onConflictDoUpdate({
      target: [pointsEarned.wallet, pointsEarned.source, pointsEarned.campaign],
      set: {
        amount: sql.raw(`excluded.${pointsEarned.amount.name}`),
        block: sql.raw(`excluded.${pointsEarned.block.name}`),
      },
    });

  return result.rowCount;
}

export async function getTopDailyPointHolders(): Promise<Leaderboard> {
  const ranking = await db
    .select({
      wallet: pointsEarned.wallet,
      source: pointsEarned.source,
      total: sql<number>`SUM(${pointsEarned.amount})`,
      referral: sql<number>`SUM(CASE WHEN ${pointsEarned.source} = 'referral' THEN ${pointsEarned.amount} ELSE 0 END)`,
      boost: sql<number>`SUM(CASE WHEN ${pointsEarned.source} = 'boost' THEN ${pointsEarned.amount} * ${pointsEarned.multiplier} ELSE 0 END)`,
    })
    .from(pointsEarned)
    .groupBy(pointsEarned.wallet, pointsEarned.source);

  return ranking.map<LeaderboardRank>((points, rank) => ({
    rank: rank + 1,
    wallet: points.wallet,
    dailyPoints: points.total - points.boost - points.referral,
    bonusPoints: points.boost,
    referralPoints: points.referral,
  }));
}
