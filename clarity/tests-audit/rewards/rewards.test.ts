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
});