'use server';

import { db } from '@/db/drizzle';
import { Leaderboard, LeaderboardRank } from '@/db/models';
import { leaderboard } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getLeaderboard(): Promise<Leaderboard> {
  const result = await db.select().from(leaderboard).orderBy(asc(leaderboard.rank)); //.limit(100);

  return result;
}

export async function getLeaderboardRanking(wallet: string): Promise<LeaderboardRank | undefined> {
  const result = await db.select().from(leaderboard).where(eq(leaderboard.wallet, wallet)).limit(1);

  if (!!result.length) return result[0];

  return undefined;
}
