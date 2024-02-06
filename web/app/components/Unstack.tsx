// @ts-nocheck

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAppContext } from './AppContext'
import { useSTXAddress } from '../common/use-stx-address';
import {
  uintCV,
  contractPrincipalCV,
  FungibleConditionCode,
  createFungiblePostCondition,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
  callReadOnlyFunction,
  cvToJSON
} from '@stacks/transactions'
import { Alert } from './Alert';
import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from '@stacks/network';
import { stacksNetwork, formatSeconds } from '../common/utils';
import { makeContractCall } from '../common/contract-call';

export function Unstack() {
  const stxAddress = useSTXAddress();

  const { stStxBalance, stxPrice, stxRatio, bitcoinBlocksLeft, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const [amount, setAmount] = useState<string | undefined>('');
  const [amountInDollars, setAmountInDollars] = useState<number | undefined>(0);
  const [stxReceived, setStxReceived] = useState<number | undefined>(0);
  const [buttonText, setButtonText] = useState('Unstack');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [bitflowRatio, setBitflowRatio] = useState(0);
  const [stxReceivedBitflow, setStxReceivedBitflow] = useState<number | undefined>(0);
  const [isLoadingBitflowData, setLoadingBitflowData] = useState(true);

  const updateAmount = async (event: { target: { value: SetStateAction<string>; }; }) => {
    const amount = event.target.value;
    setAmount(amount);
    setAmountInDollars((stxPrice * stxRatio * event.target.value).toFixed(2));
    setStxReceived(stxRatio * event.target.value);
    setStxReceivedBitflow(await bitflowOut(Number(event.target.value)));

    if (amount > stStxBalance) {
      setButtonText("Insufficient Balance");
      setButtonDisabled(true);
    } else {
      setButtonText("Unstack");
      setButtonDisabled(!amount || !stxAddress || amount > stStxBalance);
    }
  };

  const maxClicked = async () => {
    const amount = stStxBalance
    setAmount(amount);
    setAmountInDollars((stxPrice * stxRatio * amount).toFixed(2));
    setStxReceived(stxRatio * amount);
    setStxReceivedBitflow(await bitflowOut(amount));

   setButtonText("Unstack");
   setButtonDisabled(false);
  }

  const sellStStx = async () => {
    window.open("https://app.bitflow.finance/trade", '_blank', 'noreferrer');
  }

  const unstackStx = async () => {
    const stStxAmount = Number(amount) * 1000000;
    const postConditions = [
      createFungiblePostCondition(
        stxAddress!,
        FungibleConditionCode.LessEqual,
        uintCV(stStxAmount).value,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'ststx-token',
          'ststx'
        )
      ),
      makeStandardNonFungiblePostCondition(
        stxAddress!,
        NonFungibleConditionCode.Sends,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'ststx-withdraw-nft',
          'ststx-withdraw'
        ),
        uintCV(1)
      )
    ];

    await makeContractCall({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'stacking-dao-core-v1',
      functionName: 'init-withdraw',
      functionArgs: [
        contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS, 'reserve-v1'),
        uintCV(stStxAmount)
      ],
      postConditionMode: 0x01,
      network: stacksNetwork,
    }, async (error?, txId?) => {
      setCurrentTxId(txId);
      setCurrentTxStatus('pending');
    });
  };

  const bitflowOut = async (amountIn: number) => {
    setLoadingBitflowData(true);
    const resultOut = await callReadOnlyFunction({
      contractAddress: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M",
      contractName: 'stableswap-stx-ststx-v-1-2',
      functionName: 'get-dx',
      functionArgs: [
        contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, "ststx-token"),
        contractPrincipalCV("SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M", "stx-ststx-lp-token-v-1-2"),
        uintCV(amountIn * 1000000)
      ],
      senderAddress: stxAddress,
      // Hiro API gives read error. This endpoint is from Bitflow.
      network: new StacksMainnet({ url: "https://anm8bm7vhj.execute-api.us-east-2.amazonaws.com/mainnet/" })
    });
    const out = cvToJSON(resultOut).value.value / 1000000;
    setLoadingBitflowData(false);
    return out;
  }

  const bitflowRate = async () => {
    const out = await bitflowOut(1);
    setBitflowRatio(Number(out));
  }

  useEffect(() => {
    if (stxAddress) bitflowRate();
  }, [stxAddress]);

  return (
    <div className="pt-0 top-0 left-0 w-full md:relative md:min-h-full md:z-0 flex flex-col px-0 md:max-w-xl items-center mb-12">
      <div className="py-3 px-0 sm:px-6 flex w-full font-medium text-2xl md:text-4xl md:px-0 gap-3.5 items-center justify-start">
        <Link href="/">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-ststx" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>
        <span className="flex-grow">Unstack</span>
      </div>

      <div className="p-0 sm:p-2 pt-0 w-full border-2 rounded-xl p-4">
        <div className="bg-white rounded-xl w-full p-4 mb-2 hidden">
          <div className="py-1 px-2 flex gap-4 justify-start items-center">
            <img alt="Checkmark illustration" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" src="/orange-checkmark.svg" style={{color: 'transparent'}} />
            <div className="text-xl font-semibold">
              Referral Code
              <span className="text-sm font-normal block">You clicked on the link using the promo code</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl w-full p-4 font-medium overflow-x-hidden">
          <div className="flex gap-4 items-center">
            <img alt="Input asset icon" loading="lazy" width="48" height="48" decoding="async" data-nimg="1" className="rounded-full" src="/sdao-logo.jpg" style={{color: 'transparent'}} />
            <div className="flex-grow text-xl">
              stSTX
              <span className="text-tertiary-text text-base block">
                Balance: {' '}
                {stStxBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })} 
                {' '}stSTX
              </span>
            </div>
          </div>
          <div className="mt-10 mb-5 flex flex-col items-center relative max-w-full overflow-x-clip">
            <div className="relative">
              <div className="w-full text-center text-6xl" style={{display: 'inline-block'}}>
                <input
                  autoFocus
                  placeholder="0.0"
                  min="0"
                  className="!outline-none text-center"
                  inputMode="numeric"
                  type="text"
                  value={amount}
                  onChange={evt => updateAmount(evt)}
                />
              </div>
              <span className="absolute top-0 right-0 translate-x-full text-tertiary-text text-xl">stSTX</span>
            </div>
            <span className="text-tertiary-text">~${amountInDollars.toLocaleString()}</span>
            <button
              type="button"
              className="absolute right-0 top-1/2 -translate-y-3 bg-white rounded-full border border-additional-text py-2.5 px-1"
              onClick={() => maxClicked() }
            >
              MAX
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl w-full p-4 flex flex-col gap-4 font-medium mt-2 bg-slate-50 rounded-xl border-2 border-gray-100">
          <span className='font-bold'>Unstack from PoX</span>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-600">
              Time to receive STX 
            </div>
            <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
            <a className="group max-w-max relative flex block gap-1" href="#">
              {Number(bitcoinBlocksLeft) <= 100 ? (
                <span>End of Cycle (~{formatSeconds(21000+(10*bitcoinBlocksLeft)).toLocaleString()})</span>
              ) : (
                <span>End of Cycle (~{formatSeconds(10*bitcoinBlocksLeft).toLocaleString()})</span>
              )}

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <div className="[transform:perspective(50px)_translateZ(0)_rotateX(10deg)] group-hover:[transform:perspective(0px)_translateZ(0)_rotateX(0deg)] absolute bottom-0 mb-6 origin-bottom transform rounded text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                <div className="flex max-w-xs flex-col items-center w-64">
                  <div className="rounded bg-gray-900 p-2 text-xs text-center shadow-lg">
                    The STX that&apos;s backing your stSTX is locked in Stacks consensus in 2 week cycles. STX can only be unstacked by Stacking DAO at the end of a Stacks Consensus cycle.
                  </div>
                  <div className="clip-bottom h-2 w-4 bg-gray-900"></div>
                </div>
              </div>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-600">
              Conversion rate
            </div>
            <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
              1 stSTX = {stxRatio} STX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-600">
              You receive
            </div>
            <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
              {stxReceived.toLocaleString()} STX
            </div>
          </div>

          <Alert type={Alert.type.WARNING} className='rounded-full'>
            <p>
              Unstacking STX will give you a withdrawal NFT that allows you to withdraw the STX tokens after the current PoX yield cycle ends.
            </p>
            <p className="mt-2">
              <a className="font-bold" href="https://docs.stackingdao.com/stackingdao/the-stacking-dao-app/withdrawing-stx" target="_blank">Learn more about withdrawals</a>
            </p>
          </Alert>

          <button
            type="button"
            className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg ${buttonDisabled ? 'bg-gray-400' : 'button-ststx'} text-white active:bg-button-active hover:bg-button-hover w-full mt-3`}
            disabled={buttonDisabled}
            onClick={unstackStx}
          >
            {buttonText}
          </button>

        </div>

        <div className="bg-white rounded-xl w-full p-4 flex flex-col gap-4 font-medium mt-4 bg-slate-50 rounded-xl border-2 border-gray-100">
          <span className='font-bold'>Sell stSTX on Bitflow</span>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-600">
              Time to receive STX 
            </div>
            <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
              Instant
            </div>
          </div>

          {isLoadingBitflowData ? (
            <div role="status" className="flex text-center flex-col items-center mt-4">
              <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="text-gray-600">
                  Conversion rate
                </div>
                <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
                  1 stSTX = {' '}
                  {bitflowRatio.toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })} 
                  {' '} STX
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="text-gray-600">
                  You receive
                </div>
                <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
                  ~{stxReceivedBitflow.toLocaleString()} STX
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg ${buttonDisabled ? 'bg-gray-400' : 'button-ststx'} text-white active:bg-button-active hover:bg-button-hover w-full mt-3`}
            disabled={buttonDisabled}
            onClick={sellStStx}
          >
            Sell
          </button>

        </div>

      </div>
    </div>
  )
}
