import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import { ClarityType, StandardPrincipalCV, standardPrincipalCV, uintCV } from "@stacks/transactions";

import Base from "./base";
import { ISIP9 } from "./interfaces";


export default class SIP9 extends Base implements ISIP9 {
    getLastTokenId(): bigint { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-last-token-id",
                [],
                this.deployer
            );
        return (tx.result as any)["value"]["value"];
    }

    getTokenURI(tokenId: bigint): string { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-token-uri",
                [uintCV(tokenId)],
                this.deployer
            );
        
        return tx.result.type === ClarityType.ResponseErr ? "" : (tx.result as any)["data"] as string;
    }

    getOwner(tokenId: bigint): StandardPrincipalCV | null { 
        const tx: ParsedTransactionResult =
            this.chain.callReadOnlyFn(
                this.principal,
                "get-owner",
                [uintCV(tokenId)],
                this.deployer
            );
        // Since `nft-get-owner?` returns a `some`/`none` we need to unwrap it 1 level deeper and also check for different return types
        if (tx.result.type === ClarityType.ResponseErr) return null;
        if (tx.result.type === ClarityType.OptionalNone) return null;
        return (tx.result as any)["value"]["value"];
    }

    transfer(tokenId: bigint, from: string, to: string, caller?: string): boolean { 
        const tx: ParsedTransactionResult =
            this.chain.callPublicFn(
                this.principal,
                "transfer",
                [
                    uintCV(tokenId),
                    standardPrincipalCV(from),
                    standardPrincipalCV(to)
                ],
                caller ? caller : from
            );
        return tx.result.type === ClarityType.ResponseOk;
    }
}