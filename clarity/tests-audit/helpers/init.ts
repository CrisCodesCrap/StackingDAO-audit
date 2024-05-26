import { initSimnet } from "@hirosystems/clarinet-sdk";

import { Contracts, Deployment } from "./interfaces";
import Core from "./core";
import StSTXWithdrawNFT from "./stSTXWithdrawNFT";
import Rewards from "./rewards";
import Reserve from "./reserve";
import  SimnetMixin  from "./utils";


export default async function initChain(): Promise<Deployment> {
    const chain = SimnetMixin(await initSimnet());

    const wallets = chain.getAccounts();
    const deployer: string = wallets.get("deployer")!

    const core = new Core(chain, deployer, "stacking-dao-core-v2");
    const reserve = new Reserve(chain, deployer, "reserve-v1");
    const rewards = new Rewards(chain, deployer, "rewards-v1");
    const stSTXWithdrawNFT = new StSTXWithdrawNFT(chain, deployer, "ststx-withdraw-nft");

    return {
        chain: chain,
        deployer: deployer,
        wallets: wallets,
        contracts: { core, stSTXWithdrawNFT, reserve, rewards } as Contracts,
    };
}