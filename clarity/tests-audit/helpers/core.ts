import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import { ClarityType, contractPrincipalCV, noneCV, uintCV } from "@stacks/transactions";

import Base from "./base";
import { ICore } from "./interfaces";


export default class Core extends Base implements ICore {
    getShutDownDeposits(): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-shutdown-deposits",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }

    getStackFee(): bigint {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-stack-fee",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }

    getUnstackFee(): bigint {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-unstack-fee",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }

    getWithdrawUnlockBurnHeight(): bigint {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-withdraw-unlock-burn-height",
                [],
                this.deployer
            );
        return (tx.result as any)["value"];
    }

    deposit(
        reserve: string,
        commission: string,
        staking: string,
        directHelpers: string,
        stxAmount: bigint,
        referrer?: string,
        pool?: string,
        caller?: string
    ): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "deposit",
                [
                    contractPrincipalCV(this.deployer, reserve),
                    contractPrincipalCV(this.deployer, commission),
                    contractPrincipalCV(this.deployer, staking),
                    contractPrincipalCV(this.deployer, directHelpers),
                    uintCV(stxAmount),
                    referrer ? contractPrincipalCV(this.deployer, referrer) : noneCV(),
                    pool ? contractPrincipalCV(this.deployer, pool) : noneCV(),
                ],
                caller ? caller : this.deployer
            );
        return tx.result.type === ClarityType.ResponseOk;
    }
    
    initWithdraw(reserve: string, directHelpers: string, stSTXAmount: bigint, caller?: string): boolean {
        const tx = this.chain.callPublicFn(
            this.principal,
            "init-withdraw",
            [
                contractPrincipalCV(this.deployer, reserve),
                contractPrincipalCV(this.deployer, directHelpers),
                uintCV(stSTXAmount),
            ],
            caller ? caller : this.deployer
        );
        return tx.result.type === ClarityType.ResponseOk;
    }

    cancelWithdraw(reserve: string, directHelpers: string, nftId: bigint, pool?: string, caller?: string): boolean {
        const tx = this.chain.callPublicFn(
            this.principal,
            "cancel-withdraw",
            [
                contractPrincipalCV(this.deployer, reserve),
                contractPrincipalCV(this.deployer, directHelpers),
                uintCV(nftId),
                pool ? contractPrincipalCV(this.deployer, pool) : noneCV(),
            ],
            caller ? caller : this.deployer
        );
        return tx.result.type === ClarityType.ResponseOk;
    }

    withdraw(reserve: string, commission: string, staking: string, nftId: bigint, caller?: string): boolean {
        const tx = this.chain.callPublicFn(
            this.principal,
            "withdraw",
            [
                contractPrincipalCV(this.deployer, reserve),
                contractPrincipalCV(this.deployer, commission),
                contractPrincipalCV(this.deployer, staking),
                uintCV(nftId),
            ],
            caller ? caller : this.deployer
        );
        return tx.result.type === ClarityType.ResponseOk;
    }
    
}