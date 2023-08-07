'use client'

import { useAuth, useAccount } from '@micro-stacks/react'
import { useEffect, useState } from 'react'
import { getRPCClient } from '../common/utils'
import { ApyModal } from './ApyModal';
import { RatioModal } from './RatioModal';
import Link from 'next/link'

export function Stacking() {
  const { stxAddress } = useAccount();
  const { openAuthRequest } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [stxBalance, setStxBalance] = useState(0);
  const [stStxBalance, setStStxBalance] = useState(0);
  const [apy, setApy] = useState(0);
  const [yieldPerYear, setYieldPerYear] = useState(0);
  const [showApyInfo, setShowApyInfo] = useState(false);
  const [showRatioInfo, setShowRatioInfo] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      const client = getRPCClient();
      // TODO: set token in config/.env
      const stStxAddress = 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token::diko';
      const url = `${client.url}/extended/v1/address/${stxAddress}/balances`;
      const response = await fetch(url, { credentials: 'omit' });
      const data = await response.json();

      const balance = Number(data['stx']['balance']);
      const lockedBalance = Number(data['stx']['locked']);
      const totalBalance = (balance - lockedBalance) / 1000000;
      setStxBalance(totalBalance);
      setApy(7.11);

      if (data['fungible_tokens'][stStxAddress]) {
        const stackedBalance = data['fungible_tokens'][stStxAddress]['balance'] / 1000000;
        setStStxBalance(stackedBalance);
        setYieldPerYear(((7.11 / 100.0) * stackedBalance));
      }

      setIsLoading(false);
    };

    if (stxAddress) {
      fetchBalances();
    }
  }, [stxAddress]);

  return (
    <>
      <div className="w-full text-center hidden md:block font-semibold text-4xl my-8">Stacking</div>
      {showApyInfo && (
        <ApyModal open={showApyInfo} setOpen={setShowApyInfo} />
      )}
      {showRatioInfo && (
        <RatioModal open={showRatioInfo} setOpen={setShowRatioInfo} />
      )}
      {stxAddress ? (
        <div className="w-full min-h-full flex flex-col px-2 md:max-w-xl items-center">
          <div className="bg-white border-2 rounded-xl w-full p-4">
            <div className="flex justify-between font-medium">
              <div>
                <span className="text-primary font-bold">Stacked</span>
                {isLoading ? (
                  <div className="flex w-full h-3 my-3 rounded-md bg-zinc-100 animate-pulse">
                    <div className="flex items-center w-[75%]">
                      <div className="w-1/3 h-full bg-gray-400/70 rounded-l-md" />
                      <div className="w-1/3 h-full bg-gray-400/80" />
                      <div className="w-1/3 h-full bg-gray-400/90" />
                    </div>
                    <div className="w-[25%] bg-gray-400 rounded-r-md" />
                  </div>
                ) : (
                  <span className="text-lg block font-semibold">{stStxBalance.toLocaleString()} stSTX</span>
                )}
              </div>
              <div className="text-end">
                <span className="text-tertiary-text font-bold">Available</span>
                {isLoading ? (
                  <div className="flex w-full h-3 my-3 rounded-md bg-zinc-100 animate-pulse">
                    <div className="flex items-center w-[75%]">
                      <div className="w-1/3 h-full bg-gray-400/70 rounded-l-md" />
                      <div className="w-1/3 h-full bg-gray-400/80" />
                      <div className="w-1/3 h-full bg-gray-400/90" />
                    </div>
                    <div className="w-[25%] bg-gray-400 rounded-r-md" />
                  </div>
                ) : (
                  <span className="text-lg block font-semibold">{stxBalance.toLocaleString()} STX</span>
                )}
              </div>
            </div>
            <div className="flex gap-0.5 h-5 w-full mt-3">
              <div className="h-full rounded" style={{width: '82.8406%', backgroundImage: 'linear-gradient(45deg, rgb(85, 70, 255) 25%, rgb(85, 70, 255) 25%, rgb(85, 70, 255) 50%, rgb(85, 70, 255) 50%, rgb(85, 70, 255) 75%, rgb(85, 70, 255) 75%, rgb(85, 70, 255) 100%)', backgroundSize: '10px 10px'}}></div>
              <div className="h-full rounded" style={{width: '16.15936%', backgroundImage: 'linear-gradient(45deg, rgb(210, 220, 227) 25%, rgb(202, 214, 211) 25%, rgb(202, 214, 211) 50%, rgb(210, 220, 227) 50%, rgb(210, 220, 227) 75%, rgb(202, 214, 211) 75%, rgb(202, 214, 211) 100%)', backgroundSize: '10px 10px'}}></div>
            </div>
            <div className="mt-4 mb-4 flex justify-between">
              <div className="mt-1 flex gap-2 items-center font-semibold">
                Projected yield
                <button type="button" onClick={() => { setShowApyInfo(true)}} className="text-base w-fit flex gap-1 rounded-full px-2 items-center font-bold bg-primary/10 text-primary">
                  APY {apy}%
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-4 h-4 text-opacity-60" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 11-26 26 26 26 0 0126-26zm48 226h-88a16 16 0 010-32h28v-88h-16a16 16 0 010-32h32a16 16 0 0116 16v104h28a16 16 0 010 32z"></path>
                  </svg>
                </button>
              </div>
              <div className="mt-1 flex gap-2 items-center font-semibold">
                1 stSTX =
                <button type="button" onClick={() => { setShowRatioInfo(true)}} className="text-base w-fit flex gap-1 rounded-full px-2 items-center font-bold bg-primary/10 text-primary">
                  1.12727 STX
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-4 h-4 text-opacity-60" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 11-26 26 26 26 0 0126-26zm48 226h-88a16 16 0 010-32h28v-88h-16a16 16 0 010-32h32a16 16 0 0116 16v104h28a16 16 0 010 32z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 items-end font-medium">
              <span className="text-primary text-5xl font-semibold">~{yieldPerYear.toLocaleString()}</span>STX/per year
            </div>
            <Link href="/stack" className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-primary text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 my-4 w-full mt-14">
              Stack more STX
            </Link>
            <div className="flex gap-2 justify-center items-center">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-warning-text" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M35.42 188.21l207.75 269.46a16.17 16.17 0 0025.66 0l207.75-269.46a16.52 16.52 0 00.95-18.75L407.06 55.71A16.22 16.22 0 00393.27 48H118.73a16.22 16.22 0 00-13.79 7.71L34.47 169.46a16.52 16.52 0 00.95 18.75zM48 176h416"></path>
                <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M400 64l-48 112-96-128M112 64l48 112 96-128m0 400l-96-272m96 272l96-272"></path>
              </svg>
              Stack STX and earn rewards
            </div>
          </div>
          <Link href="/unstack" className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-gray-400 text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 my-4 w-full mt-14">
            Unstack stSTX
          </Link>
          <div className="bg-white rounded-xl w-full p-4 mt-2 hidden">
            <div className="py-1 px-2 flex gap-4 justify-start items-center">
              <img alt="Checkmark illustration" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" src="/ilustrations/orange-checkmark.svg" style={{color: 'transparent'}} />
              <div className="text-xl font-semibold">
                Referral Code<span className="text-sm font-normal block">You clicked on the link using the promo code</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full md:max-w-xl min-h-full flex flex-col px-2 pb-10 items-center">
          <div className="bg-white rounded-xl w-full p-4">
            <h1 className="text-center text-3xl font-semibold mt-2">
              All you ever need in one place for <span className="text-primary">Stacks Stacking</span>
            </h1>
            <p className="text-center text-base text-secondary-text font-normal mt-3 mb-6">
              Start stacking STX, review your existing STX locked in PoX, and unstack at any time, for the best price.
            </p>
            <button type="button" className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-primary text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full mb-2"
              onClick={async () => {
                await openAuthRequest();
              }}
            >
              Connect wallet
            </button>
          </div>
        </div>
      )}
    </>
  )
}
