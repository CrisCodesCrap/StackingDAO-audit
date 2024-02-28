import { callReadOnlyFunction } from '@stacks/transactions';
import { coreApiUrl, stacksNetwork } from "@/app/common/utils";
import { Handler } from "@netlify/functions";

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

const fetchPoX = async () => {
  const url = coreApiUrl + "/v2/pox";
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}

export const handler: Handler = async (event, context) => {
  const [
    stxPrice,
    tvlInStx,
    pox,
  ] = await Promise.all([
    fetchStxPrice(),
    fetchTVL(),
    fetchPoX(),
  ]);
  const tvl = stxPrice * tvlInStx;

  const result = { 
    pox_cycle: pox.current_cycle.id,
    pox_stx_locked: tvlInStx,
    pox_avg_apy: 6.35,
    stackingdao_tvl: tvl 
  }

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
