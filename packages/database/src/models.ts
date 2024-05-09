import { wallets, pointsEarned, leaderboard, referrals, balances } from './schema';

export type Wallet = typeof wallets.$inferSelect;
export type WalletWithPoints = typeof wallets.$inferSelect & { points: string };
export type WalletSnapshot = typeof wallets.$inferInsert;
export type WalletUpdate = Omit<typeof wallets.$inferInsert, 'snapshotBalance'>;

export type PointsRecord = typeof pointsEarned.$inferSelect;
export type NewPointsRecord = typeof pointsEarned.$inferInsert;

export type PointSource = PointsRecord['source'];

export type LeaderboardRank = typeof leaderboard.$inferSelect;
export type Leaderboard = LeaderboardRank[];
export type NewLeaderboard = (typeof leaderboard.$inferInsert)[];

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;

export type Balances = typeof balances.$inferSelect;
export type NewBalanceSnapshot = typeof balances.$inferInsert;
