'use server';

import {and, desc, eq, lte, sql} from 'drizzle-orm';
import {Balances, NewBalanceSnapshot, Wallet, WalletUpdate} from '../models';
import {balances, wallets} from '../schema';
import {db} from '../drizzle';

/**
 * wallets TABLE ACTIONS
 */

export async function upsertWallet(...new_wallets: WalletUpdate[]): Promise<number> {
    if (!new_wallets.length) return 0;

    const result = await db.insert(wallets).values(new_wallets).onConflictDoNothing();

    return result.rowCount;
}

export async function insertNewWallets(new_wallets: WalletUpdate[]): Promise<number> {
    const result = await db.insert(wallets).values(new_wallets).onConflictDoNothing();

    return result.rowCount;
}

export async function getAllWallets(): Promise<Wallet[]> {
    const result = await db.select().from(wallets);

    console.log(`found ${result.length} wallets`);

    return result;
}

/**
 * balances TABLE ACTIONS
 */

export async function getLatestBalance(address: string): Promise<Balances | undefined> {
    const result = await db
        .select()
        .from(balances)
        .where(eq(balances.wallet, address))
        .orderBy(desc(balances.blockHeight))
        .limit(1);

    console.log(result);

    if (!result.length) return undefined;

    return result[0];
}

export async function getBalanceAt(address: string, block_height: number): Promise<Balances> {
    const result = await db.select().from(balances).where(
        and(
            eq(balances.wallet, address),
            lte(balances.blockHeight, block_height),
        ),
    ).orderBy(desc(balances.blockHeight)).limit(1);

    if (result.length > 0) return result[0];

    return {
        wallet: address,
        blockHeight: block_height,
        arkadiko: 0,
        bitflow: 0,
        hermetica: 0,
        ststx: 0,
        velar: 0,
        zest: 0
    };
}

export async function writeBalanceSnapshots(...snapshots: NewBalanceSnapshot[]): Promise<number> {
    const result = await db
        .insert(balances)
        .values(snapshots)
        .onConflictDoUpdate({
            target: [balances.wallet, balances.blockHeight],
            set: {
                ststx: sql.raw(`excluded.${balances.ststx.name}`),
                bitflow: sql.raw(`excluded.${balances.bitflow.name}`),
                zest: sql.raw(`excluded.${balances.zest.name}`),
                arkadiko: sql.raw(`excluded.${balances.arkadiko.name}`),
                velar: sql.raw(`excluded.${balances.velar.name}`),
                hermetica: sql.raw(`excluded.${balances.hermetica.name}`),
            },
        });

    return result.rowCount;
}
