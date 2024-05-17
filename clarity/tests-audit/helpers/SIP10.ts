import { ParsedTransactionResult, Simnet } from "@hirosystems/clarinet-sdk";
import { Cl, ClarityType, standardPrincipalCV, uintCV } from "@stacks/transactions";

import Base from "./base";


export default class SIP10 extends Base { 
    decimals: bigint;

    constructor(chain: Simnet, deployer: string, name: string, decimals: bigint) {
        super(chain, deployer, name);
        this.decimals = decimals;
    }
    
    toBase<T = bigint>(amount: bigint, explicit: boolean = true): T {
        const value: bigint = amount * BigInt(Math.pow(10, Number(this.decimals)));
        return (!explicit ? value : uintCV(value)) as T;
    }

    fromBase<T = bigint>(amount: bigint, explicit: boolean = true): T {
        const value: bigint = amount / BigInt(Math.pow(10, Number(this.decimals)));
        return (!explicit ? value : uintCV(value)) as T;
    }

    fromDecimals<T = bigint>(amount: bigint, decimals: bigint, explicit: boolean = true): T {
        const value: bigint = decimals > this.decimals ? amount / BigInt(Math.pow(10, Number(decimals - this.decimals))) : amount * BigInt(Math.pow(10, Number(this.decimals - decimals)));
        return (!explicit ? value : uintCV(value)) as T;
    }

    toDecimals<T = bigint>(amount: bigint, decimals: bigint, explicit: boolean = true): T {
        const value: bigint = decimals > this.decimals ? amount * BigInt(Math.pow(10, Number(decimals - this.decimals))) : amount / BigInt(Math.pow(10, Number(this.decimals - decimals)));
        return (!explicit ? value : uintCV(value)) as T;
    }

    mint(amount: bigint, to: string = this.deployer): boolean { 
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "mint",
                [this.toBase(amount), standardPrincipalCV(to)],
                this.deployer
            )
        return tx.result.type === ClarityType.ResponseOk;
    }

    burn(amount: bigint, from: string = this.deployer): boolean { 
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "burn",
                [this.toBase(amount), standardPrincipalCV(from)],
                this.deployer
            )
        return tx.result.type === ClarityType.ResponseOk;
    }

    getBalance<T = bigint>(address: string, explicit: boolean = true): T {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-balance",
                [standardPrincipalCV(address)],
                this.deployer
            )
        return (!explicit ? BigInt((tx.result as any)["value"]["value"]) : tx.result) as T;
    }

    transfer(amount: bigint, from: string, to: string): boolean { 
        if (from === to) return false;

        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "transfer",
                [
                    this.toBase(amount),
                    standardPrincipalCV(from),
                    standardPrincipalCV(to),
                    Cl.none()
                ],
                from
            )
        return tx.result.type === ClarityType.ResponseOk;
    }
}