import { wallets, pointsEarned, leaderboard } from './schema';

export type Wallet = typeof wallets.$inferSelect;
export type WalletWithPoints = typeof wallets.$inferSelect & { points: string };
export type WalletSnapshot = typeof wallets.$inferInsert;
export type WalletUpdate = Omit<typeof wallets.$inferInsert, 'snapshotBalance'>;

export type PointsRecord = typeof pointsEarned.$inferSelect;
export type NewPointsRecord = typeof pointsEarned.$inferInsert;

export type PointSource = Pick<PointsRecord, 'source'>;

export type LeaderboardRank = typeof leaderboard.$inferSelect;
export type Leaderboard = LeaderboardRank[];
export type NewLeaderboard = (typeof leaderboard.$inferInsert)[];
