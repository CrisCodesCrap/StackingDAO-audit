ALTER TYPE "points_source" ADD VALUE 'boost';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "balances" (
	"wallet" varchar NOT NULL,
	"block_height" integer NOT NULL,
	"ststx" numeric(16, 0) DEFAULT 0 NOT NULL,
	"bitflow" numeric(16, 0) DEFAULT 0 NOT NULL,
	"zest" numeric(16, 0) DEFAULT 0 NOT NULL,
	"arkadiko" numeric(16, 0) DEFAULT 0 NOT NULL,
	"velar" numeric(16, 0) DEFAULT 0 NOT NULL,
	"hermetica" numeric(16, 0) DEFAULT 0 NOT NULL,
	CONSTRAINT "balances_wallet_block_height_pk" PRIMARY KEY("wallet","block_height")
);
--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_daily" SET DATA TYPE numeric(16, 0);--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_daily" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_referral" SET DATA TYPE numeric(16, 0);--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_referral" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_bonus" SET DATA TYPE numeric(16, 0);--> statement-breakpoint
ALTER TABLE "leaderboard" ALTER COLUMN "points_bonus" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "points_earned" ALTER COLUMN "amount" SET DATA TYPE numeric(16, 0);--> statement-breakpoint
ALTER TABLE "points_earned" ADD COLUMN "boost" varchar;--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN IF EXISTS "snapshot_balance";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN IF EXISTS "ststx_balance";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "balances" ADD CONSTRAINT "balances_wallet_wallets_address_fk" FOREIGN KEY ("wallet") REFERENCES "wallets"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
