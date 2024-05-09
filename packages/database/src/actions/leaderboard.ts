'use server';

import { sql, eq, asc } from 'drizzle-orm';
import { NewLeaderboard, Leaderboard, LeaderboardRank } from '../models';
import { leaderboard } from '../schema';
import { db } from '../drizzle';

export async function getLeaderboard(): Promise<Leaderboard> {
  const result = await db.select().from(leaderboard).orderBy(asc(leaderboard.rank)); //.limit(100);

  return result;
}

export async function getLeaderboardRanking(wallet: string): Promise<LeaderboardRank | undefined> {
  const result = await db.select().from(leaderboard).where(eq(leaderboard.wallet, wallet)).limit(1);

  if (result.length > 0) return result[0];

  return undefined;
}

export async function updateLeaderboard(records: NewLeaderboard): Promise<number> {
  const result = await db
    .insert(leaderboard)
    .values(records)
    .onConflictDoUpdate({
      target: leaderboard.rank,
      set: {
        wallet: sql.raw(`excluded.${leaderboard.wallet.name}`),
        dailyPoints: sql.raw(`excluded.${leaderboard.dailyPoints.name}`),
        referralPoints: sql.raw(`excluded.${leaderboard.referralPoints.name}`),
        bonusPoints: sql.raw(`excluded.${leaderboard.bonusPoints.name}`),
      },
    });

  return result.rowCount;
}
