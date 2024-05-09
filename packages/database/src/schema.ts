import {
  pgEnum,
  pgTable,
  serial,
  integer,
  timestamp,
  real,
  varchar,
  index,
  unique,
  primaryKey,
  customType,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const currency = customType<{ data: number }>({
  dataType() {
    return 'numeric(16, 0)';
  },
  fromDriver(value) {
    return Number(value);
  },
});

export const wallets = pgTable(
  'wallets',
  {
    address: varchar('address', { length: 64 }).primaryKey(),
    firstSeenAtBlock: varchar('first_seen_at_block', { length: 128 }),
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
  'boost',
  'referral',
  'ststx',
  'bitflow',
  'zest',
  'arkadiko',
  'velar',
  'hermetica',
]);

export const balances = pgTable(
  'balances',
  {
    wallet: varchar('wallet')
      .references(() => wallets.address)
      .notNull(),
    blockHeight: integer('block_height').notNull(),
    ststx: currency('ststx').notNull().default(0),
    bitflow: currency('bitflow').notNull().default(0),
    zest: currency('zest').notNull().default(0),
    arkadiko: currency('arkadiko').notNull().default(0),
    velar: currency('velar').notNull().default(0),
    hermetica: currency('hermetica').notNull().default(0),
  },
  table => ({
    pk: primaryKey({ columns: [table.wallet, table.blockHeight] }),
  })
);

export const pointsEarned = pgTable(
  'points_earned',
  {
    id: serial('id').primaryKey(),
    wallet: varchar('wallet')
      .references(() => wallets.address)
      .notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    source: pointsSourceEnum('source').notNull(),
    amount: currency('amount').notNull(),
    multiplier: real('multiplier').default(1.0).notNull(),
    block: varchar('block_hash', { length: 128 }).notNull(),
    campaign: varchar('boost'),
  },
  table => ({
    sourceIdx: index('wallet_source_idx').on(table.wallet).asc(),
    perBlockIdx: unique().on(table.wallet, table.block, table.source),
  })
);

export const referrals = pgTable(
  'referrals',
  {
    id: serial('id').primaryKey(),
    referrer: varchar('address')
      .references(() => wallets.address)
      .notNull(),
    stacker: varchar('stacker')
      .references(() => wallets.address)
      .notNull(),
    blockHeight: integer('block_height').notNull(),
  },
  table => ({
    uniqueReferrerToStacker: unique().on(table.referrer, table.stacker),
  })
);

export const leaderboard = pgTable(
  'leaderboard',
  {
    rank: serial('rank').primaryKey(),
    wallet: varchar('wallet')
      .references(() => wallets.address)
      .notNull(),
    dailyPoints: currency('points_daily').notNull().default(0),
    referralPoints: currency('points_referral').notNull().default(0),
    bonusPoints: currency('points_bonus').notNull().default(0),
  },
  table => ({
    walletIdx: index('wallet_idx').on(table.wallet).asc(),
  })
);

export const walletRelations = relations(wallets, ({ many, one }) => ({
  points: many(pointsEarned),
}));
