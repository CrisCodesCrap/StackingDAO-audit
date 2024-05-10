ALTER TABLE "referrals" RENAME COLUMN "address" TO "referrer";--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_address_stacker_unique";--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_address_wallets_address_fk";
--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_stacker_pk" PRIMARY KEY("referrer","stacker");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_wallets_address_fk" FOREIGN KEY ("referrer") REFERENCES "wallets"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "referrals" DROP COLUMN IF EXISTS "id";