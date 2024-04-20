import * as db from "@/packages/db/actions";
import { NewPointsRecord, WalletUpdate } from "@/packages/db/models";
import { BlocksApi } from "@stacks/blockchain-api-client";
import { Context, EventBridgeEvent } from "aws-lambda";

type AggregateFile = Record<
    string,
    { user_points: number; referral_points: number }
>;

const url = "https://stackingdao-points.s3.amazonaws.com";
const blocks = new BlocksApi();

export async function migrate(url: string): Promise<void> {
    // 1. Fetch the latest points aggregate and other info.
    const aggregateFile = await fetch(url + "/points-aggregate-8.json");
    const aggregate = (await aggregateFile.json()) as AggregateFile;

    const lastBlockFile = await fetch(url + "/points-last-block-8.json");
    const lastBlock = (await lastBlockFile.json()).last_block as string;
    const block = await blocks.getBlock({ heightOrHash: lastBlock });

    // 2. Create a zero-balance wallet for every address found in the aggregate.
    //    note: This works due to the fact that the current balance is only
    //          required for calculating booster points after instantiation.
    console.log("creating new wallets");
    const addresses = Object.keys(aggregate);
    const wallets = addresses.map<WalletUpdate>((address) => ({ address }));
    const walletsCreated = await db.insertNewWallets(wallets);

    console.log(`Created ${walletsCreated} new wallets`);

    // 3. Add a "migration" record to db with their current points total.
    const points = Object.entries(aggregate).map<NewPointsRecord>(
        ([address, totals]) => ({
            wallet: address,
            source: "migration",
            amount: Math.ceil(totals.user_points).toString(),
            block: block.hash,
        }),
    );

    // TODO: too many queries apparently
    const pointsCreated = await db.addPointRecords(points);

    console.log(`Added ${pointsCreated} "migration" records`);
}

migrate(url);
