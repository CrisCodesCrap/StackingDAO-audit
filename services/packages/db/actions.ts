"use server";

import { sql, asc, gt, or, and, eq, inArray, desc } from "drizzle-orm";
import { db } from "./client";
import {
    NewPointsRecord,
    WalletUpdate,
    Wallet,
    WalletWithPoints,
    NewLeaderboard,
    Leaderboard,
    LeaderboardRank,
} from "./models";
import { leaderboard, pointsEarned, wallets } from "./schema";

export async function upsertWallets(
    new_wallets: WalletUpdate[],
): Promise<number> {
    const result = await db
        .insert(wallets)
        .values(new_wallets)
        .onConflictDoUpdate({
            target: wallets.address,
            set: {
                currentBalance: sql.raw(
                    `excluded.${wallets.currentBalance.name}`,
                ),
            },
        });

    return result.rowCount;
}

export async function insertNewWallets(
    new_wallets: WalletUpdate[],
): Promise<number> {
    const result = await db
        .insert(wallets)
        .values(new_wallets)
        .onConflictDoNothing();

    return result.rowCount;
}

export async function snapshotWallets(
    block_hash: string,
    new_wallets: WalletUpdate[],
): Promise<number> {
    const result = await db
        .insert(wallets)
        .values(new_wallets)
        .onConflictDoUpdate({
            target: wallets.address,
            set: {
                currentBalance: sql.raw(
                    `excluded.${wallets.currentBalance.name}`,
                ),
                snapshotBalance: sql.raw(
                    `excluded.${wallets.snapshotBalance.name}`,
                ),
            },
        });

    return result.rowCount;
}

export async function nextWalletsPage(
    cursor?: {
        address: string;
        createdAt: Date;
    },
    pageSize = 50,
): Promise<Wallet[]> {
    return await db
        .select()
        .from(wallets)
        .where(
            // make sure to add indices for the columns that you use for cursor
            cursor
                ? or(
                      gt(wallets.createdAt, cursor.createdAt),
                      and(
                          eq(wallets.createdAt, cursor.createdAt),
                          gt(wallets.address, cursor.address),
                      ),
                  )
                : undefined,
        )
        .limit(pageSize)
        .orderBy(asc(wallets.createdAt), asc(wallets.address));
}

export async function readWalletWithBoosterPoints(
    addresses: string[],
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

export async function updateLeaderboard(
    records: NewLeaderboard,
): Promise<number> {
    const result = await db
        .insert(leaderboard)
        .values(records)
        .onConflictDoUpdate({
            target: leaderboard.rank,
            set: {
                wallet: sql.raw(`excluded.${leaderboard.wallet.name}`),
                dailyPoints: sql.raw(
                    `excluded.${leaderboard.dailyPoints.name}`,
                ),
                referralPoints: sql.raw(
                    `excluded.${leaderboard.referralPoints.name}`,
                ),
                bonusPoints: sql.raw(
                    `excluded.${leaderboard.bonusPoints.name}`,
                ),
            },
        });

    return result.rowCount;
}

export async function getTopDailyPointHolders({
    limit = 100,
}: {
    limit: number;
}): Promise<Leaderboard> {
    const points = db.$with("points").as(
        db
            .select({
                wallet: wallets.address,
                dailyPoints:
                    sql<string>`COALESCE(SUM(${pointsEarned.amount} * ${pointsEarned.multiplier}), 0)`.as(
                        "dailyPoints",
                    ),
                bonusPoints:
                    sql<string>`GREATEST((${wallets.currentBalance} - ${wallets.snapshotBalance}) * 20, 0)`.as(
                        "bonusPoints",
                    ),
            })
            .from(wallets)
            .leftJoin(pointsEarned, eq(wallets.address, pointsEarned.wallet))
            .groupBy(wallets.address),
    );

    const total = db.$with("total").as(
        db
            .with(points)
            .select({
                wallet: points.wallet,
                total: sql<string>`${points.dailyPoints} + ${points.bonusPoints}`.as(
                    "totalPoints",
                ),
            })
            .from(points),
    );

    const result = await db
        .with(points, total)
        .select({
            wallet: total.wallet,
            dailyPoints: points.dailyPoints,
            bonusPoints: points.bonusPoints,
        })
        .from(total)
        .leftJoin(points, eq(total.wallet, points.wallet))
        .orderBy(desc(total.total))
        .limit(limit);

    return result.map<LeaderboardRank>((value, rank) => ({
        rank: rank + 1,
        wallet: value.wallet,
        dailyPoints: value.dailyPoints,
        bonusPoints: value.bonusPoints,
        referralPoints: "0",
    }));
}

export async function addPointRecords(
    records: NewPointsRecord[],
): Promise<number> {
    const result = await db
        .insert(pointsEarned)
        .values(records)
        .onConflictDoNothing();

    return result.rowCount;
}

export async function populatePointsTable(wallets: string[]): Promise<number> {
    const records: NewPointsRecord[] = [];

    for (const wallet of wallets) {
        for (let i = 1; i <= 10; i++) {
            const record: NewPointsRecord = {
                wallet,
                source: "ststx",
                amount: "100",
                block: "test_block",
                multiplier: Math.floor(Math.random() * i),
            };

            records.push(record);
        }
    }

    const result = await db.insert(pointsEarned).values(records);

    return result.rowCount;
}
