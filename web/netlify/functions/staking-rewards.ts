// @ts-nocheck

import { callReadOnlyFunction, contractPrincipalCV } from '@stacks/transactions';
import { stacksNetwork } from "@/app/common/utils";
import { Handler } from "@netlify/functions";

const fetchStxPrice = async () => {
  // Fetch STX price
  const url = 'https://laozi1.bandchain.org/api/oracle/v1/request_prices?ask_count=16&min_count=10&symbols=STX';
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  if (data['price_results']?.length > 0) {
    const priceSTX = data['price_results'][0]['px'] / Number(data['price_results'][0]['multiplier']);
    return priceSTX;
  }

  return 0;
}

const fetchTVL = async () => {
  // Total STX
  const result: any = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
    contractName: 'reserve-v1',
    functionName: 'get-total-stx',
    functionArgs: [],
    senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
    network: stacksNetwork
  });
  const totalSTX = Number(result.value?.value) / 1000000;

  return totalSTX;
}

const fetchSupply = async () => {
  // Total STX
  const result: any = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
    contractName: 'ststx-token',
    functionName: 'get-total-supply',
    functionArgs: [],
    senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
    network: stacksNetwork
  });
  const totalSTX = Number(result.value?.value) / 1000000;

  return totalSTX;
}

const fetchRatio = async () => {
  const result = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
    contractName: 'stacking-dao-core-v1',
    functionName: 'get-stx-per-ststx',
    functionArgs: [
      contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1')
    ],
    senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
    network: stacksNetwork
  });

  return parseFloat(result?.value?.value) / 1000000.0;
};

const fetchUsers = async () => {
  const url = "https://stackingdao-points.s3.amazonaws.com/points-aggregate-4.json";
  const response = await fetch(url);
  const data = await response.json();

  return Object.keys(data).length;
}

export const handler: Handler = async (event, context) => {
  const [
    stxPrice,
    tvlInStx,
    stStxSupply,
    ratio,
    totalUsers
  ] = await Promise.all([
    fetchStxPrice(),
    fetchTVL(),
    fetchSupply(),
    fetchRatio(),
    fetchUsers()
  ]);
  const tvl = stxPrice * tvlInStx;
  const result = {
    "name": 'Stacking DAO',
    "totalUsers": totalUsers,
    "totalBalanceUsd": Number(tvl.toFixed(2)),
    "supportedAssets": [
      {
        "contractAddress": "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG",
        "symbol": "stSTX",
        "slug": "stacked-stx",
        "baseSlug": "stacks",
        "supply": stStxSupply, // LST balance
        "apr": 6.35, // in %
        "fee": 5, // in %
        "users": totalUsers,
        "unstakingTime": 1209600, // it takes 1d to unstake
        "exchangeRatio": ratio, // conversion from LST to ETH
        "pointsBreakdown": [  // (Optional)
          {
            "name": "Stacking DAO Points"
          }
        ]
      }
    ]
  };

  return {
    body: JSON.stringify(result),
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTION",
    },
  }
}
