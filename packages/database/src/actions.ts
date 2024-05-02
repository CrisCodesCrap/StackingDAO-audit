"use server";

import { sql, eq, inArray, asc, sum, avg } from 'drizzle-orm';
import {
  NewPointsRecord,
  WalletUpdate,
  Wallet,
  WalletWithPoints,
  NewLeaderboard,
  Leaderboard,
  LeaderboardRank,
} from './models';
import { leaderboard, pointsEarned, wallets } from './schema';
import { db } from './drizzle';

export async function getLeaderboard(): Promise<Leaderboard> {
  const result = await db.select().from(leaderboard).orderBy(asc(leaderboard.rank)); //.limit(100);

  return result;
}

export async function getLeaderboardRanking(wallet: string): Promise<LeaderboardRank | undefined> {
  const result = await db.select().from(leaderboard).where(eq(leaderboard.wallet, wallet)).limit(1);

  if (!!result.length) return result[0];

  return undefined;
}

export async function upsertWallets(new_wallets: WalletUpdate[]): Promise<number> {
  if (!new_wallets.length) return 0;

  const result = await db
    .insert(wallets)
    .values(new_wallets)
    .onConflictDoUpdate({
      target: wallets.address,
      set: {
        currentBalance: sql.raw(`excluded.${wallets.currentBalance.name}`),
      },
    });

  return result.rowCount;
  // return result.numberOfRecordsUpdated ?? 0;
}

export async function insertNewWallets(new_wallets: WalletUpdate[]): Promise<number> {
  const result = await db.insert(wallets).values(new_wallets).onConflictDoNothing();

  return result.rowCount;
  // return result.numberOfRecordsUpdated ?? 0;
}

export async function snapshotWallet(
  block_hash: string,
  new_wallet: WalletUpdate
): Promise<number> {
  const result = await db
    .insert(wallets)
    .values(new_wallet)
    .onConflictDoUpdate({
      target: wallets.address,
      set: {
        currentBalance: sql.raw(`excluded.${wallets.currentBalance.name}`),
        snapshotBalance: sql.raw(`excluded.${wallets.snapshotBalance.name}`),
      },
    });

  return result.rowCount;
  // return result.numberOfRecordsUpdated ?? 0;
}

export async function nextWalletsPage(limit?: number): Promise<Wallet[]> {
  const query = db.select().from(wallets);

  if (limit) return await query.limit(limit);
  return await query;
}

export async function readWalletWithBoosterPoints(
  addresses: string[]
): Promise<WalletWithPoints[]> {
  return await db
    .selectDistinct({
      address: wallets.address,
      firstSeenAtBlock: wallets.firstSeenAtBlock,
      snapshotBalance: wallets.snapshotBalance,
      currentBalance: wallets.currentBalance,
      createdAt: wallets.createdAt,
      points: sql<string>`(${wallets.currentBalance} - ${wallets.snapshotBalance}) * 20`,
    })
    .from(wallets)
    .where(inArray(wallets.address, addresses));
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
  // return result.numberOfRecordsUpdated ?? 0;
}

export async function getTopDailyPointHolders(): Promise<Leaderboard> {
  const points = await db
    .select({
      wallet: wallets.address,
      source: pointsEarned.source,
      multiplier: avg(pointsEarned.multiplier),
      amount: sum(pointsEarned.amount).mapWith(String),
      points: sql<string>`COALESCE(SUM(${pointsEarned.amount} * ${pointsEarned.multiplier}), 0)`.as(
        'dailyPoints'
      ),
      bonusPoints:
        sql<string>`GREATEST((${wallets.currentBalance} - ${wallets.snapshotBalance}) * 20 / 1000000, 0)`.as(
          'bonusPoints'
        ),
    })
    .from(wallets)
    .leftJoin(pointsEarned, eq(wallets.address, pointsEarned.wallet))
    .groupBy(wallets.address, pointsEarned.source);

  const result: Record<string, { daily: number; referral: number; bonus: number }> = {};
  for (const record of points) {
    result[record.wallet] ??= { daily: 0, referral: 0, bonus: 0 };
    result[record.wallet].bonus = Number.parseInt(record.bonusPoints ?? '0');

    switch (record.source) {
      case 'referral':
        result[record.wallet].referral = Number.parseInt(record.amount ?? '0');
        break;
      default:
        result[record.wallet].daily = Number.parseInt(record.points);
    }
  }

  const ranking = Object.entries(result).sort(
    ([_, a], [__, b]) => b.bonus + b.daily + b.referral - (a.bonus + a.daily + a.referral)
  );

  return ranking.map<LeaderboardRank>(([wallet, points], rank) => ({
    rank: rank + 1,
    wallet,
    dailyPoints: points.daily.toString(),
    bonusPoints: points.bonus.toString(),
    referralPoints: points.referral.toString(),
  }));
}

export async function addPointRecords(records: NewPointsRecord[]): Promise<number> {
  const result = await db.insert(pointsEarned).values(records).onConflictDoNothing();

  return result.rowCount;
  // return result.numberOfRecordsUpdated ?? 0;
}

export async function resetMigration(): Promise<number> {
  const result = await db
    .delete(pointsEarned)
    .where(inArray(pointsEarned.source, ['migration', 'referral']));

  return result.rowCount;
}

export async function migratePointRecords(records: NewPointsRecord[]): Promise<number> {
  for (const record of records) {
    if (!['migration', 'referral'].includes(record.source))
      throw new Error('tried to migrate a non-migration record');
  }

  const result = await db
    .insert(pointsEarned)
    .values(records)
    .onConflictDoUpdate({
      target: [pointsEarned.wallet, pointsEarned.block, pointsEarned.source],
      set: {
        amount: sql.raw(`excluded.${pointsEarned.amount.name}`),
      },
    });

  return result.rowCount;
  // return result.numberOfRecordsUpdated ?? 0;
}

export async function populatePointsTable(wallets: string[]): Promise<number> {
  const records: NewPointsRecord[] = [];

  for (const wallet of wallets) {
    for (let i = 1; i <= 10; i++) {
      const record: NewPointsRecord = {
        wallet,
        source: 'ststx',
        amount: '100',
        block: 'test_block',
        multiplier: Math.floor(Math.random() * i),
      };

      records.push(record);
    }
  }

  const result = await db.insert(pointsEarned).values(records);

  return result.rowCount;
  // return result.numberOfRecordsUpdated ?? 0;
}
