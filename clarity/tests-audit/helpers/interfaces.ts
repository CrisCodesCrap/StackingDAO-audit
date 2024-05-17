import { Simnet } from "@hirosystems/clarinet-sdk";
import { ClarityValue } from "@stacks/transactions";

export interface BaseContract {
    chain: Simnet;
    name: string;
    deployer: string;
    principal: string;
    principalCV: ClarityValue;
}

export interface SIP10Contract extends BaseContract {
    decimals: bigint;
    toBase: <T>(amount: bigint, explicit?: boolean) => T 
    fromBase: <T>(amount: bigint, explicit?: boolean) => T;
    toDecimals: <T>(amount: bigint, decimals: bigint, explicit?: boolean) => T;
    fromDecimals: <T>(amount: bigint, decimals: bigint, explicit?: boolean) => T;
    getBalance: <T>(address: string) => T;
    transfer: (amount: bigint, from: string, to: string) => boolean;
    mint: (amount: bigint, to: string) => boolean;
    burn: (amount: bigint, from: string) => boolean;
}

export interface CoreContract extends BaseContract { 
    // TODO
}

export interface RewardsContract extends BaseContract {
    getTotalCommission: () => bigint;
    getTotalRewardsLeft: () => bigint;
    getRewardsUnlock: () => bigint;
    getNextRewardsUnlock: () => bigint;
    addRewards: (pool: string, amount: bigint) => boolean;
    processRewards: (commission?: string, staking?: string, reserve?: string, caller?: string) => boolean;
}

export interface ReserveContract extends BaseContract { 
    // TODO

}

export type Contracts = {
    core: CoreContract;
    reserve: ReserveContract;
    rewards: RewardsContract;
}

export type Deployment = {
    chain: Simnet,
    deployer: string,
    wallets: Map<string, string>,
    contracts: Contracts
}