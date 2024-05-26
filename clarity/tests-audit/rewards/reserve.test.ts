import { beforeEach, describe } from "vitest";

import { Simnet } from "@hirosystems/clarinet-sdk";

import initChain from "../helpers/init";
import { Contracts } from "../helpers/interfaces";


describe.skip("reserve-v1", () => {
    let chain: Simnet;
    let contracts: Contracts;
    let deployer: string;
    let wallets: Map<string, string>;

    beforeEach(async () => {
        ({ chain, deployer, wallets, contracts } = await initChain());
    });

    
});