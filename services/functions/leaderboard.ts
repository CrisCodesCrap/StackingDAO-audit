import { SNSEvent } from "aws-lambda";
import * as db from "@/packages/db/actions";

interface WalletsUpdatedEvent {
    block_hash: string;
    wallets: string[];
}

// export async function track(event: SNSEvent, _: Context): Promise<void> {
export async function calculate(event: SNSEvent): Promise<void> {
    for (const record of event.Records) {
        // 1. Parse addresses we received.
        const update = JSON.parse(record.Sns.Message) as WalletsUpdatedEvent;

        // 3. Update leaderboard.
        console.log("updating leaderboard for block", update.block_hash);
        const newLeaderboard = await db.getTopDailyPointHolders({ limit: 100 });

        // 4. Write new leaderboard to db.
        console.log("writing new leaderboard to db");
        const recordsWritten = await db.updateLeaderboard(newLeaderboard);

        console.log(`Updated leaderboard with ${recordsWritten} new rows`);
    }
}
