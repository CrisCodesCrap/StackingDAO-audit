// @ts-nocheck

import { RPCClient } from '@stacks/rpc-client';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
require('dotenv').config();

const env = process.env.NEXT_PUBLIC_NETWORK_ENV || 'mainnet';

export let coreApiUrl = 'https://api.hiro.so';
// export let coreApiUrl = "https://small-solemn-frost.stacks-mainnet.discover.quiknode.pro/deaf86bafdfbef850e40cdf5fa22c41cd447cdff"

if (env.includes('mocknet')) {
  coreApiUrl = `http://localhost:${process.env.LOCAL_STACKS_API_PORT || 3999}`;
  // coreApiUrl = 'https://dull-liger-41.loca.lt';
} else if (env.includes('testnet')) {
  coreApiUrl = 'https://api.testnet.hiro.so';
} else if (env.includes('regtest')) {
  coreApiUrl = 'https://stacks-node-api.regtest.stacks.co';
}

export function getExplorerLink(txId: string) {
  const url = location.origin.includes('localhost')
    ? `http://localhost:3999/extended/v1/tx/${txId}`
    : `https://explorer.hiro.so/txid/${txId}?chain=mainnet`;
  return url;
};

export const getRPCClient = () => {
  return new RPCClient(coreApiUrl);
};

export const stacksNetwork = env === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
(stacksNetwork.coreApiUrl as any) = coreApiUrl;

export const blocksToTime = (blocks:number) => {
  const minutesPerBlock = 10;
  const minutesLeft = blocks * minutesPerBlock;
  const hoursLeft = Math.floor(minutesLeft / 60);

  const days = Math.floor(hoursLeft / 24);
  const hours = Math.round(hoursLeft % 24);
  const minutes = Math.round(minutesLeft % 60);

  if (days == 0 && hours == 0) {
    return minutes + "m";
  } else if (days == 0 && minutes == 0) {
    return hours + "h";
  } else if (hours == 0 && minutes == 0) {
    return days + "d";

  } else if (days == 0) {
    return hours + "h, " + minutes + "m";
  } else if (hours == 0) {
    return days + "d, " + minutes + "m";
  } else if (minutes == 0) {
    return days + "d, " + hours + "h";;
  }
  return days + "d, " + hours + "h, " + minutes + "m";
};

export const resolveProvider = () => {
  const providerName = localStorage.getItem('stacking-sign-provider');
  if (!providerName) return null;

  if (providerName === 'xverse' && window.XverseProviders?.StacksProvider) {
    return window.XverseProviders?.StacksProvider;
  } else if (providerName === 'asigna' && window.AsignaProvider) {
    return window.AsignaProvider;
  } else if (providerName === 'okx' && window.okxwallet && window.okxwallet?.stacks) {
    return window.okxwallet.stacks;
  } else if (window.LeatherProvider) {
    return window.LeatherProvider;
  } else if (window.HiroWalletProvider) {
    return window.HiroWalletProvider;
  } else {
    return window.StacksProvider;
  }
};

export const formatSeconds = function (totalmins)  {
  if (Math.sign(totalmins) != -1) {
    const mins= totalmins % 60;
    const hours = Math.floor(totalmins / 60);
    const days= Math.floor(hours / 24);
    const hourss = hours % 24;
    return days + 'd, ' + hourss + 'h, ' + mins + 'm';
  } else {
    const absTotal= Math.abs(totalmins);
    const mins= absTotal % 60;
    const hours = Math.floor(absTotal / 60);
    const days= Math.floor(hours / 24);
    const hourss = hours % 24;
    return days + 'd, ' + hourss + 'h, ' + mins + 'm';
  }
}
