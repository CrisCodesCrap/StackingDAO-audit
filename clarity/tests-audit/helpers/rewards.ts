import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import { ClarityType, contractPrincipalCV, uintCV } from "@stacks/transactions";

import Base from "./base";
import { IRewards } from "./interfaces";


export default class Rewards extends Base implements IRewards {
    getTotalCommission(): bigint {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-total-commission",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }
    
    getTotalRewardsLeft(): bigint {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-total-rewards-left",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }

    getRewardsUnlock(): bigint {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-rewards-unlock",
                [],
                this.deployer
            );
        return (tx.result as any)["data"];
    }

    getNextRewardsUnlock(): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-next-rewards-unlock",
                [],
                this.deployer
            );
        return (tx.result as any)["data"];
    }

    addRewards(pool: string, amount: bigint, caller?: string): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "add-rewards",
                [
                    contractPrincipalCV(this.deployer, pool),
                    uintCV(amount)
                ],
                caller ? caller : this.deployer
            );
        return tx.result.type === ClarityType.ResponseOk;
    }

    processRewards(commission: string = "commission-v2", staking: string = "staking-v1", reserve: string = "reserve-v1", caller?: string): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "process-rewards",
                [
                    contractPrincipalCV(this.deployer, commission),
                    contractPrincipalCV(this.deployer, staking),
                    contractPrincipalCV(this.deployer, reserve)
                ],
                caller ? caller : this.deployer
            );
        return tx.result.type === ClarityType.ResponseOk;
    }
}