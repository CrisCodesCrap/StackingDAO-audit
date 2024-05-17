import { beforeEach, describe, expect, it } from "vitest";

import { Simnet } from "@hirosystems/clarinet-sdk";
import { contractPrincipalCV } from "@stacks/transactions";

import initChain from "../helpers/init";
import { Contracts } from "../helpers/interfaces";


describe("rewards contract test suite", () => {
    let chain: Simnet;
    let contracts: Contracts;
    let deployer: string;
    let wallets: Map<string, string>;

    beforeEach(async () => { 
        ({chain, deployer, wallets, contracts} = await initChain());
    });

    it("rewards getting maliciously stuck", async () => { 
        expect(contracts.rewards.getTotalRewardsLeft()).toBe(0n);
        expect(contracts.rewards.getTotalCommission()).toBe(0n);

        // @audit Adding rewards
        expect(contracts.rewards.addRewards("stacking-pool-v1", 1000n)).toBe(true);

        // @audit Passing the needed blocks until funds unlock
        chain.mineEmptyBlocks(5);

        // @audit Processing the rewards
        expect(contracts.rewards.processRewards());

        // @audit Asserting all rewards have been processed
        expect(contracts.rewards.getTotalRewardsLeft()).toBe(0n);
        expect(contracts.rewards.getTotalCommission()).toBe(0n);

        // @audit Adding rewards again
        expect(contracts.rewards.addRewards("stacking-pool-v1", 1000n)).toBe(true);
        // @audit Asserting that rewards have been added
        expect(contracts.rewards.getTotalRewardsLeft()).not.toBe(0n);
        expect(contracts.rewards.getTotalCommission()).not.toBe(0n);

        // @audit Sending the funds to a different contract that will pass the `check-is-protocol` check
        expect(contracts.rewards.processRewards("commission-v2", "staking-v1", "stacking-dao-core-v2")).toBe(true);

        // @audit Asserting all rewards have been processed with the wrong stx recipient
        expect(contracts.rewards.getTotalRewardsLeft()).toBe(0n);
        expect(contracts.rewards.getTotalCommission()).toBe(0n);
    });
});