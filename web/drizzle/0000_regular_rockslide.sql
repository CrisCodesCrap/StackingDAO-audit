DO $$ BEGIN
 CREATE TYPE "points_source" AS ENUM('migration', 'referral', 'ststx', 'bitflow', 'zest', 'arkadiko', 'velar');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leaderboard" (
	"rank" serial PRIMARY KEY NOT NULL,
	"wallet" varchar NOT NULL,
	"points_daily" numeric(128, 0) DEFAULT '0' NOT NULL,
	"points_referral" numeric(128, 0) DEFAULT '0' NOT NULL,
	"points_bonus" numeric(128, 0) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "points_earned" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"source" "points_source" NOT NULL,
	"amount" numeric(128, 0) NOT NULL,
	"multiplier" real DEFAULT 1 NOT NULL,
	"block_hash" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"address" varchar(64) PRIMARY KEY NOT NULL,
	"first_seen_at_block" varchar(128),
	"snapshot_balance" numeric(128, 0) DEFAULT '0' NOT NULL,
	"ststx_balance" numeric(128, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wallet_source_idx" ON "points_earned" ("wallet");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "wallets" ("created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_wallet_wallets_address_fk" FOREIGN KEY ("wallet") REFERENCES "wallets"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "points_earned" ADD CONSTRAINT "points_earned_wallet_wallets_address_fk" FOREIGN KEY ("wallet") REFERENCES "wallets"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
