import {
    SmartContractsApi,
    TransactionEventsResponse,
} from "@stacks/blockchain-api-client";
import { TransactionEvent } from "@stacks/stacks-blockchain-api-types";

const contracts = new SmartContractsApi();

export async function getContractEventsForBlock(
    contract: string,
    limit: number,
): Promise<TransactionEvent[]> {
    let allRecords: TransactionEvent[] = [];
    let offset = 0;
    let nextPageExists = true;

    try {
        while (nextPageExists) {
            const data = (await contracts.getContractEventsById({
                contractId: contract,
                offset,
            })) as TransactionEventsResponse;

            allRecords = allRecords.concat(data.results as TransactionEvent[]);
            offset += data.results.length;
            nextPageExists = offset < limit;
        }
    } catch (e) {
        console.error(e);
    }

    return allRecords;
}

export interface CV<T> {
    type: string;
    value: T;
}

export interface ParsedEvent {
    contract_id: string;
    action: ParsedAction;
}

export interface ParsedAction {
    action?: CV<"deposit" | "transfer" | "vaults-set">;
    data?: CV<Data>;
    owner?: CV<string>;
}

export interface Data {
    amount: CV<number>;
    referrer?: CV<string>;
    stacker?: CV<string>;
    recipient?: CV<string>;
    sender?: CV<string>;
}
