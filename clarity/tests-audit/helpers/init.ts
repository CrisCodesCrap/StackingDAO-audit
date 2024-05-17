import { initSimnet } from "@hirosystems/clarinet-sdk";

import Core from "./core";
import { Contracts, Deployment } from "./interfaces";
import Rewards from "./rewards";
import Reserve from "./reserve";


export default async function initChain(): Promise<Deployment> {
    const chain = await initSimnet();

    const wallets = chain.getAccounts();
    const deployer: string = wallets.get("deployer")!

    const core = new Core(chain, deployer, "stacking-dao-core-v2");
    const reserve = new Reserve(chain, deployer, "reserve-v1");
    const rewards = new Rewards(chain, deployer, "rewards-v1");

    return {
        chain: chain,
        deployer: deployer,
        wallets: wallets,
        contracts: { core, reserve, rewards } as Contracts
    };
}