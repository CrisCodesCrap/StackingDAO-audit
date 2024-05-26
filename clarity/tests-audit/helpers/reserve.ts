import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import { uintCV } from "@stacks/transactions";

import Base from "./base";
import { IReserve } from "./interfaces";


export default class Reserve extends Base implements IReserve {
    getSTXForWithdrawals(): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-stx-for-withdrawals",
                [],
                this.deployer
            );
        return (tx.result as any)["value"]["value"];
    }

    getSTXStacking(): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-stx-stacking",
                [],
                this.deployer
            );
        return (tx.result as any)["value"]["value"];
    
    }

    getSTXStackingAtBlock(block: bigint): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-stx-stacking-at-block",
                [uintCV(block)],
                this.deployer
            );
        return (tx.result as any)["value"]["value"];
    }

    getSTXBalance(): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-stx-balance",
                [],
                this.deployer
            );
        return (tx.result as any)["value"]["value"];
    }

    getTotalSTX(): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-total-stx",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }
}