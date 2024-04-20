import { getTransactionsByBlockHash } from "@/packages/stacks/transactions";
import { writeFile } from "fs/promises";
import {
    TransactionsApi,
    SmartContractsApi,
    AccountsApi,
} from "@stacks/blockchain-api-client";
import { ContractCallTransaction } from "@stacks/stacks-blockchain-api-types";

const contracts = new SmartContractsApi();
const accounts = new AccountsApi();
// const transactions = new TransactionsApi();

async function subscribeToBlockEvents(): Promise<void> {
    // for testnet, replace with wss://api.testnet.hiro.so/
    // const client = await connectWebSocketClient("wss://api.mainnet.hiro.so/");

    // client.subscribeBlocks((block) => processNewBlock(block.hash));
    // console.log("listening for confirmed blocks...");
    await processNewBlock(
        "0xd6bdbbc6a94a9f0017c3d7c53369bc048747e8d0b8da024d78762e0e4bba6043",
    );
}

async function processNewBlock(block: string): Promise<void> {
    // console.log("Received block ", block);

    // const txs = await getTransactionsByBlockHash(block);

    // await writeFile("block.json", JSON.stringify(txs, null, 2), "utf-8");
    // console.log("done");

    const ctr = await accounts.getAccountBalance({
        principal: "SP96WZM65J7STR939MS364609ZYPR23YT6FPKH3S",
    });

    console.log(JSON.stringify(ctr, null, 2));

    // const tx = (await transactions.getTransactionById({
    //     txId: block,
    // })) as ContractCallTransaction;

    // console.log(`This tx should have ${tx.event_count} events`);
    // console.log(JSON.stringify(tx.events));
}

subscribeToBlockEvents();
