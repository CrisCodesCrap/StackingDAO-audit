ALTER TABLE "balances" ALTER COLUMN "ststx" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "balances" ALTER COLUMN "bitflow" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "balances" ALTER COLUMN "zest" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "balances" ALTER COLUMN "arkadiko" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "balances" ALTER COLUMN "velar" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "balances" ALTER COLUMN "hermetica" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_daily" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_referral" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_bonus" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
ALTER TABLE "points_earned" ALTER COLUMN "amount" SET DATA TYPE numeric(16, 6);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "block_height_idx" ON "balances" ("block_height","wallet");