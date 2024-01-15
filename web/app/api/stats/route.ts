import { NextResponse } from "next/server";
import { callReadOnlyFunction } from '@stacks/transactions';
import { coreApiUrl } from "@/app/common/utils";

const fetchTVL = async () => {
  const result: any = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
    contractName: 'reserve-v1',
    functionName: 'get-total-stx',
    functionArgs: [],
    senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
  });
  const totalSTX = Number(result.value?.value) / 1000000;

  const url = "https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd&precision=6";
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  const priceSTX = data.blockstack.usd;

  return priceSTX * totalSTX;
}

const fetchPoX = async () => {
  const url = coreApiUrl + "/v2/pox";
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}

export async function GET() {
  const [
    tvl,
    pox,
  ] = await Promise.all([
    fetchTVL(),
    fetchPoX(),
  ]);

  return NextResponse.json({ 
    pox_cycle: pox.current_cycle.id,
    pox_stx_locked: pox.current_cycle.stacked_ustx / 1000000,
    pox_avg_apy: 7.65,
    stackingdao_tvl: tvl 
  }, { status: 200 });
}
