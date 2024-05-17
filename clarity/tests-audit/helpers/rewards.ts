import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import { ClarityType, contractPrincipalCV, principalCV, uintCV } from "@stacks/transactions";

import Base from "./base";
import { RewardsContract } from "./interfaces";


export default class Rewards extends Base implements RewardsContract {
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
        return (tx.result as any)["value"];
    }

    getNextRewardsUnlock(): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-next-rewards-unlock",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }

    addRewards(pool: string, amount: bigint, caller: string = this.deployer): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "add-rewards",
                [
                    contractPrincipalCV(this.deployer, pool),
                    uintCV(amount)
                ],
                caller
            );
        return tx.result.type === ClarityType.ResponseOk;
    }

    processRewards(commission: string = "commission-v2", staking: string = "staking-v1", reserve: string = "reserve-v1", caller: string = this.deployer): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "process-rewards",
                [
                    contractPrincipalCV(this.deployer, commission),
                    contractPrincipalCV(this.deployer, staking),
                    contractPrincipalCV(this.deployer, reserve)
                ],
                caller
            );
        return tx.result.type === ClarityType.ResponseOk;
    }
}