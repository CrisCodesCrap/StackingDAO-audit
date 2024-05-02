import {
  pgEnum,
  pgTable,
  serial,
  timestamp,
  real,
  numeric,
  varchar,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const wallets = pgTable(
  'wallets',
  {
    address: varchar('address', { length: 64 }).primaryKey(),
    firstSeenAtBlock: varchar('first_seen_at_block', { length: 128 }),
    snapshotBalance: numeric('snapshot_balance', {
      precision: 128,
      scale: 0,
    })
      .notNull()
      .default('0'),
    currentBalance: numeric('ststx_balance', {
      precision: 128,
      scale: 0,
    })
      .notNull()
      .default('0'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => {
    return {
      createdIdx: index('created_at_idx').on(table.createdAt).asc(),
    };
  }
);

export const pointsSourceEnum = pgEnum('points_source', [
  'migration',
  'referral',
  'ststx',
  'bitflow',
  'zest',
  'arkadiko',
  'velar',
  'hermetica'
]);

export const pointsEarned = pgTable(
  'points_earned',
  {
    id: serial('id').primaryKey(),
    wallet: varchar('wallet')
      .references(() => wallets.address)
      .notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    source: pointsSourceEnum('source').notNull(),
    amount: numeric('amount', { precision: 128, scale: 0 }).notNull(),
    multiplier: real('multiplier').default(1.0).notNull(),
    block: varchar('block_hash', { length: 128 }).notNull(),
  },
  table => ({
    sourceIdx: index('wallet_source_idx').on(table.wallet).asc(),
    perBlockIdx: unique().on(table.wallet, table.block, table.source),
  })
);

export const leaderboard = pgTable(
  'leaderboard',
  {
    rank: serial('rank').primaryKey(),
    wallet: varchar('wallet')
      .references(() => wallets.address)
      .notNull(),
    dailyPoints: numeric('points_daily', { precision: 128, scale: 0 }).notNull().default('0'),
    referralPoints: numeric('points_referral', { precision: 128, scale: 0 }).notNull().default('0'),
    bonusPoints: numeric('points_bonus', { precision: 128, scale: 0 }).notNull().default('0'),
  },
  table => ({
    walletIdx: index('wallet_idx').on(table.wallet).asc(),
  })
);

export const walletRelations = relations(wallets, ({ many, one }) => ({
  points: many(pointsEarned),
}));
