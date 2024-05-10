ALTER TABLE "referrals" DROP CONSTRAINT "referrals_referrer_stacker_pk";--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_stacker_unique" UNIQUE("referrer","stacker");