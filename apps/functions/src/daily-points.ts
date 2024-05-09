import type { ScheduledEvent, Context } from "aws-lambda";
import { BlocksApi, InfoApi, NakamotoBlock } from "@stacks/blockchain-api-client";
import { Balances, PointSource } from "@repo/database/src/models";
import * as db from "@repo/database/src/actions";
import { pointsSourceEnum } from "@repo/database/src/schema";
import { getActiveCampaigns } from "./campaigns";

const info = new InfoApi();
const blocks = new BlocksApi();
const pointsMapping: Partial<Record<PointSource, (balances: Balances) => [number, number]>> = {
  ststx: (balances) => [balances.ststx, 1],
  bitflow: (balances) => [balances.bitflow, 2.5],
  zest: (balances) => [balances.zest, 1.5],
  arkadiko: (balances) => [balances.arkadiko, 1.5],
  velar: (balances) => [balances.velar, 1.5],
  hermetica: (balances) => [balances.hermetica, 1.5],
};

export async function updateDailyPoints(_: ScheduledEvent, __: Context): Promise<void> {
  const coreInfo = await info.getCoreApiInfo();
  const block = await blocks.getBlock({ heightOrHash: coreInfo.stacks_tip_height });
  console.log("recording balances at block", block.height);

  const total = await calculatePointsAtBlock(block);

  console.log(`added ${total} new point records`);
}

export async function calculatePointsAtBlock(day_block: NakamotoBlock): Promise<number> {
  const wallets = await db.getAllWallets();

  let total = 0;
  const chunkSize = 50;
  for (let i = 0; i < wallets.length; i += chunkSize) {
    const chunk = wallets.slice(i, i + chunkSize);

    for (const wallet of chunk) {
      const balances = await db.getLatestBalance(wallet.address);
      if (!balances) continue;

      for (const source of pointsSourceEnum.enumValues) {
        if (source === "migration" || source === "boost" || source === "referral") continue;

        const campaignMultiplier = getActiveCampaigns(day_block.height, "daily", [source]).reduce(
          (pre, curr) => pre * curr.multiplier,
          1
        );

        const [amount, multiplier] = pointsMapping[source](balances);
        if (amount > 0) {
          const recordsAdded = await db.addPointRecords({
            wallet: wallet.address,
            source: source,
            amount: amount * multiplier * campaignMultiplier,
            block: day_block.hash,
            multiplier: multiplier * campaignMultiplier,
          });

          total += recordsAdded;
        }
      }

      const referrals = await db.getReferralsForAddress(wallet.address);
      const ranking = await db.getLeaderboardRanking(wallet.address);
      if (!ranking) continue;

      const totalPoints = ranking.dailyPoints + ranking.bonusPoints + ranking.referralPoints;
      const campaignMultiplier = getActiveCampaigns(day_block.height, "daily", ["referral"]).reduce(
        (pre, curr) => pre * curr.multiplier,
        1
      );

      for (const referral of referrals) {
        const recordsAdded = await db.addPointRecords({
          wallet: referral.referrer,
          source: "referral",
          amount: totalPoints * 0.1 * campaignMultiplier,
          block: day_block.hash,
        });

        total += recordsAdded;
      }
    }
  }

  return total;
}
