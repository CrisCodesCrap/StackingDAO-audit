import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import { ClarityType, contractPrincipalCV, standardPrincipalCV, uintCV } from "@stacks/transactions";

import { IStSTXWithdrawNFT } from "./interfaces";
import SIP9 from "./SIP9";


export default class StSTXWithdrawNFT extends SIP9 implements IStSTXWithdrawNFT {
    getBaseTokenURI(): string { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-base-token-uri",
                [],
                this.deployer
            );
        return tx.result.type === ClarityType.ResponseErr ? "" : (tx.result as any)["data"] as string;
    }

    getBalance(owner: string): bigint {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-balance",
                [standardPrincipalCV(owner)],
                this.deployer
            );
        return (tx.result as any)["data"];
    }

    uintToString(value: bigint): string {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "uint-to-string",
                [uintCV(value)],
                this.deployer
            );
        return (tx.result as any)["data"];
    }

    getListingInUSTX(id: bigint): object {
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-listing-in-ustx",
                [uintCV(id)],
                this.deployer
            );
        return (tx.result as any)["data"];
    }

    listInUSTX(id: bigint, price: bigint, commission: string, caller?: string): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "list-in-ustx",
                [
                    uintCV(id),
                    uintCV(price),
                    contractPrincipalCV(this.deployer, commission)
                ],
                caller ? caller : this.deployer
            );
        return tx.result.type === ClarityType.ResponseOk;
    }

    unlistInUSTX(id: bigint, caller?: string): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "unlist-in-ustx",
                [uintCV(id)],
                caller ? caller : this.deployer
            );
        return tx.result.type === ClarityType.ResponseOk;
    }

    buyInUSTX(id: bigint, commission: string, caller?: string): boolean {
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "buy-in-ustx",
                [
                    uintCV(id),
                    contractPrincipalCV(this.deployer, commission)
                ],
                caller ? caller : this.deployer
            );
        return tx.result.type === ClarityType.ResponseOk;
    }
}