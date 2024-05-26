import { Simnet } from "@hirosystems/clarinet-sdk";
import { ClarityValue, StandardPrincipalCV } from "@stacks/transactions";


export interface IBase {
    chain: Simnet;
    name: string;
    deployer: string;
    principal: string;
    principalCV: ClarityValue;
}

export interface ISIP9 extends IBase { 
    getLastTokenId: () => bigint;
    getTokenURI: (tokenId: bigint) => string;
    getOwner: (tokenId: bigint) => StandardPrincipalCV | null;
    transfer: (tokenId: bigint, from: string, to: string, caller?: string) => boolean;
}

export interface SIP10Contract extends IBase {
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

export interface IStSTXWithdrawNFT extends ISIP9 { 
    getBaseTokenURI: () => string;
    getBalance: (address: string) => bigint;
    uintToString: (value: bigint) => string;
    transfer: (amount: bigint, from: string, to: string) => boolean;
    getListingInUSTX: (id: bigint) => object;
    listInUSTX: (id: bigint, price: bigint, commission: string, caller?: string) => boolean;
    unlistInUSTX: (id: bigint, caller?: string) => boolean;
    buyInUSTX: (id: bigint, commission: string, caller?: string) => boolean;
}

export interface ICore extends IBase { 
    getShutDownDeposits: () => boolean;
    getStackFee: () => bigint;
    getUnstackFee: () => bigint;
    getWithdrawUnlockBurnHeight: () => bigint;
    deposit: (
        reserve: string,
        commission: string,
        staking: string,
        directHelpers: string,
        stxAmount: bigint,
        referrer?: string,
        pool?: string,
        caller?: string
    ) => boolean; 
    initWithdraw: (reserve: string, directHelpers: string, stSTXAmount: bigint, caller?: string) => boolean;
    cancelWithdraw: (reserve: string, directHelpers: string, nftId: bigint, pool?: string, caller?: string) => boolean;
    withdraw: (reserve: string, commission: string, staking: string, nftId: bigint, caller?: string) => boolean;
}

export interface IRewards extends IBase {
    getTotalCommission: () => bigint;
    getTotalRewardsLeft: () => bigint;
    getRewardsUnlock: () => bigint;
    getNextRewardsUnlock: () => bigint;
    addRewards: (pool: string, amount: bigint, caller?: string) => boolean;
    processRewards: (commission?: string, staking?: string, reserve?: string, caller?: string) => boolean;
}

export interface IReserve extends IBase { 
    getSTXForWithdrawals: () => bigint;
    getSTXStacking: () => bigint;
    getSTXStackingAtBlock: (block: bigint) => bigint;
    getSTXBalance: () => bigint;
    getTotalSTX: () => bigint;
}

export interface IUtils {
    getBalance: (token: Token, address: string) => bigint;
}

export type ExtendedSimnet = Simnet & IUtils;

export type Contracts = {
    core: ICore;
    stSTXWithdrawNFT: IStSTXWithdrawNFT;
    reserve: IReserve;
    rewards: IRewards;
}

export type Deployment = {
    chain: ExtendedSimnet,
    deployer: string,
    wallets: Map<string, string>,
    contracts: Contracts
}

export const TOKENS = {
    "STX": "STX",
    "stSTX": ".ststx-token.ststx",
    "WITHDRAW_NFT": ".ststx-withdraw-nft.ststx-withdraw",
    "wSTX": ".wstx-token.wstx",
}

export type Token = keyof typeof TOKENS;