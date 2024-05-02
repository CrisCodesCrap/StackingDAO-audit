import { TransactionsApi } from "@stacks/blockchain-api-client";
import { Transaction } from "@stacks/stacks-blockchain-api-types";

const transactions = new TransactionsApi();

export async function getTransactionsByBlockHash(
    hash: string,
): Promise<Transaction[]> {
    let allRecords: Transaction[] = [];
    let offset = 0;
    let nextPageExists = true;

    try {
        while (nextPageExists) {
            const data = await transactions.getTransactionsByBlockHash({
                blockHash: hash,
                limit: 200,
                offset,
            });

            allRecords = allRecords.concat(data.results as Transaction[]);
            offset += data.results.length;
            nextPageExists = offset < data.total;
        }
    } catch (e) {
        console.error(e);
    }

    return allRecords;
}
