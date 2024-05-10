require("dotenv").config();

import {rawBlockSQSEvent} from "./test";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

import * as db from "@repo/database/src/actions";
import * as stacks from "@repo/stacks/src/blocks";

import {userInfoAtBlock} from "@repo/stacks/src/user_info";
import {getActiveCampaigns} from "./campaigns";

import type {Context, SQSEvent} from "aws-lambda";
import type {NakamotoBlock} from "@stacks/blockchain-api-client";
import type {ParsedEvent} from "@repo/stacks/src/contracts";


// import { rawBlockSQSEvent } from "./test";

const REPLAY_COUNT = 0;
const updatesTopic = process.env.OUTGOING_SNS_TOPIC;
const sns = new SNSClient();

updateWallets(rawBlockSQSEvent, {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    awsRequestId: "",
    logGroupName: "",
    logStreamName: "",
    getRemainingTimeInMillis: function (): number {
        throw new Error("Function not implemented.");
    },
    done: function (error?: Error, result?: any): void {
        throw new Error("Function not implemented.");
    },
    fail: function (error: string | Error): void {
        throw new Error("Function not implemented.");
    },
    succeed: function (messageOrObject: any): void {
        throw new Error("Function not implemented.");
    },
});

export async function updateWallets(event: SQSEvent, _: Context): Promise<void> {
    for (const record of event.Records) {
        const latest_block = (await JSON.parse(record.body)) as NakamotoBlock;

        const blocks = await stacks.getPreviousBlocks(latest_block.height, REPLAY_COUNT);

        for (const {block, events, addresses} of blocks) {
            if (addresses.length == 0) continue;

            // await updateWalletsForBlock(block, addresses);
            await updateReferrals(block, events);
        }
    }
}

export async function updateWalletsForBlock(block: NakamotoBlock, addresses: string[]): Promise<void> {
    const campaigns = getActiveCampaigns(block.height, "one-time-boost", [
        "arkadiko",
        "bitflow",
        "hermetica",
        "ststx",
        "velar",
        "zest",
    ]);

    // 1. Get each address' stSTX balances and update wallets + record the snapshot.
    let totalUpdated = {wallets: 0, snapshots: 0, points: 0};
    for (const address of addresses) {
        const [balances, totals] = await userInfoAtBlock(address, block.height);

        const walletsUpdated = await db.upsertWallet({address, firstSeenAtBlock: block.hash});
        totalUpdated.wallets += walletsUpdated;

        const snapshotsUpdated = await db.writeBalanceSnapshots(balances);
        totalUpdated.snapshots += snapshotsUpdated;

        for (const campaign of campaigns) {
            const snapshot = await db.getBalanceAt(address, campaign.start_block);

            const totalSnapshot = snapshot.ststx + snapshot.bitflow + snapshot.arkadiko + snapshot.zest + snapshot.hermetica + snapshot.velar;
            const bonus = (totals.total - totalSnapshot) * campaign.multiplier;

            if (bonus > 0) {
                const pointsUpdated = await db.upsertCampaignPoints({
                    wallet: address,
                    source: "boost",
                    amount: bonus,
                    multiplier: campaign.multiplier,
                    block: block.hash,
                    campaign: campaign.id,
                });

                totalUpdated.points += pointsUpdated;
            }
        }
    }

    console.log(`wallets updated: ${totalUpdated.wallets}/${addresses.length}`);
    console.log(`snapshots recorded: ${totalUpdated.snapshots}/${addresses.length}`);
    console.log(`points updated: ${totalUpdated.points}/${addresses.length}`);

    // 3. Update anyone that wants to know about the wallets being updated.
    const response = await sns.send(
        new PublishCommand({
            TopicArn: updatesTopic,
            Message: block.hash,
        })
    );

    console.log(`Published message ${response.MessageId} to topic.`);
}

export async function updateReferrals(block: NakamotoBlock, events: ParsedEvent[]): Promise<void> {
    console.log(`Processing block referrals for ${block.height}`);

    const referrals = stacks.processBlockReferrals(block.height, events);

    let total = 0;
    for (const referral of referrals) {
        const updated = await db.insertReferral(referral);

        total += updated;
    }

    console.log(`Updated or created ${total}/${referrals.length} referrals`);
}
