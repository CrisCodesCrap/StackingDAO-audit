export const contracts = {
    core: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v1",
    token: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token",
    swap1: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-1",
    swap2: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-2",
    arkadiko:
        "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-vaults-data-v1-1",
};

export const tokens = {
    ststx: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token::ststx",
};

const env = process.env.NEXT_PUBLIC_NETWORK_ENV || 'mainnet';
export function coreApiUrl(): string {
if (env.includes('mocknet')) {
  return `http://localhost:${process.env.LOCAL_STACKS_API_PORT || 3999}`;
  // return 'https://dull-liger-41.loca.lt';
} else if (env.includes('testnet')) {
  return 'https://api.testnet.hiro.so';
} else if (env.includes('regtest')) {
  return 'https://stacks-node-api.regtest.stacks.co';
}

// return 'https://api.hiro.so';
return 'https://small-solemn-frost.stacks-mainnet.discover.quiknode.pro/deaf86bafdfbef850e40cdf5fa22c41cd447cdff';
}