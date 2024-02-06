// @ts-nocheck

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAppContext } from './AppContext'
import { useConnect } from '@stacks/connect-react';
import {
  uintCV,
  contractPrincipalCV,
  someCV,
  standardPrincipalCV,
  noneCV,
  FungibleConditionCode,
  callReadOnlyFunction,
  cvToJSON,
  makeStandardSTXPostCondition
} from '@stacks/transactions';
import { useSTXAddress } from '../common/use-stx-address';
import { CommissionModal } from './CommissionModal';
import { useSearchParams } from 'next/navigation'
import { stacksNetwork,  } from '../common/utils';
import { StacksMainnet } from '@stacks/network';
import { makeContractCall } from '../common/contract-call';

export function Stack() {
  const stxAddress = useSTXAddress();
  const searchParams = useSearchParams();
  const referral = searchParams.get('referral');

  const { stStxBalance, stxBalance, stxPrice, stxRatio, stackingApy, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const [amount, setAmount] = useState<string | undefined>('');
  const [amountInDollars, setAmountInDollars] = useState<number | undefined>(0);
  const [stStxReceived, setStStxReceived] = useState<number | undefined>(0);
  const [showApyInfo, setShowApyInfo] = useState(false);
  const [buttonText, setButtonText] = useState('Stack');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [bitflowRatio, setBitflowRatio] = useState(0);
  const [isLoadingBitflowData, setLoadingBitflowData] = useState(true);
  const [stxReceivedBitflow, setStxReceivedBitflow] = useState<number | undefined>(0);

  const setAmounts = async (amount: number) => {
    setAmount(amount);
    setAmountInDollars(stxPrice * amount);
    setStStxReceived(amount / stxRatio);
    setStxReceivedBitflow(await bitflowOut(amount));

    const maxBalance = (stxBalance - 2);
    if (amount > maxBalance) {
      setButtonText("Insufficient Balance");
      setButtonDisabled(true);
    } else {
      setButtonText("Stack");
      setButtonDisabled(!amount || !stxAddress || amount > maxBalance);
    }
  };

  const updateAmount = (event: { target: { value: SetStateAction<string>; }; }) => {
    setAmounts(event.target.value);
  };

  const buyStStx = async () => {
    window.open("https://app.bitflow.finance/trade", '_blank', 'noreferrer');
  }

  const maxClicked = async () => {
    const amount = (stxBalance - 2).toFixed(2);
    setAmount(amount);
    setAmountInDollars(stxPrice * amount);
    setStStxReceived(amount / stxRatio);
    setStxReceivedBitflow(await bitflowOut(amount));

    setButtonText("Stack");
    setButtonDisabled(false);
  };

  const stackStx = async () => {
    const stxAmount = Number(amount) * 1000000;
    const stStxAmount = Number(stStxReceived) * 1000000 * 0.98;
    const postConditions = [
      makeStandardSTXPostCondition(stxAddress!, FungibleConditionCode.LessEqual, stxAmount)
    ];
 
    let referralParam = noneCV();
    if (referral) {
      referralParam = someCV(standardPrincipalCV(referral));
    }

    await makeContractCall({
      stxAddress: stxAddress,
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'stacking-dao-core-v1',
      functionName: 'deposit',
      functionArgs: [
        contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1'),
        uintCV(stxAmount),
        referralParam
      ],
      postConditions,
      network: stacksNetwork,
    }, async (error?, txId?) => {
      setAmounts(0);
      setCurrentTxId(txId);
      setCurrentTxStatus('pending');
    });
  };

  const bitflowOut = async (amountIn: number) => {
    setLoadingBitflowData(true);
    const resultOut = await callReadOnlyFunction({
      contractAddress: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M",
      contractName: 'stableswap-stx-ststx-v-1-2',
      functionName: 'get-dy',
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
    <>
      {showApyInfo && (
        <CommissionModal open={showApyInfo} setOpen={setShowApyInfo} />
      )}

      <div className="pt-0 top-0 left-0 w-full md:relative md:min-h-full md:z-0 flex flex-col px-0 md:max-w-xl items-center mb-12">
        <div className="py-3 px-0 sm:px-6 flex w-full font-medium text-2xl md:text-4xl md:px-0 gap-3.5 items-center justify-start">
          <Link href="/">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-ststx" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <span className="flex-grow">Stack</span>
        </div>
        <div className="p-0 sm:p-2 pt-0 w-full border-2 rounded-xl p-4">
          <div className="bg-white rounded-xl w-full p-4 font-medium overflow-x-hidden">
            <div className="flex gap-4 items-center">
              <img alt="Input asset icon" loading="lazy" width="48" height="48" decoding="async" data-nimg="1" className="rounded-full" src="/stacks-stx-logo.png" style={{color: 'transparent'}} />
              <div className="flex-grow text-xl">
                Stacks
                <span className="text-tertiary-text text-base block">
                  Balance: {' '}
                  {stxBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })} 
                  {' '}STX
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
                <span className="absolute top-0 right-0 translate-x-full text-tertiary-text text-xl">STX</span>
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

          <div className="bg-white rounded-xl w-full p-4 flex flex-col gap-4 font-medium mt-4 bg-slate-50 rounded-xl border-2 border-gray-100">
            <span className='font-bold'>Stack in PoX</span>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="text-gray-600 place-content-start">

                APY
                <button type="button" onClick={() => { setShowApyInfo(true)}} className="flex text-gray-400">
                  <div className='text-sm'>
                    Includes a 5% performance fee
                  </div>
                  <div className='pt-0.5 pl-1'>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-4 h-4 text-opacity-60" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 11-26 26 26 26 0 0126-26zm48 226h-88a16 16 0 010-32h28v-88h-16a16 16 0 010-32h32a16 16 0 0116 16v104h28a16 16 0 010 32z"></path>
                    </svg>
                  </div>
                </button>

              </div>
              <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
                <span className="text-ststx font-bold">~{stackingApy}%</span>
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
                <span>
                  ~{stStxReceived.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} 
                  {' '}stSTX
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg ${buttonDisabled ? 'bg-gray-400' : 'button-ststx'} text-white active:bg-button-active hover:bg-button-hover w-full mt-4`}
              disabled={buttonDisabled}
              onClick={stackStx}
            >
              {buttonText}
            </button>
          </div>

          <div className="bg-white rounded-xl w-full p-4 flex flex-col gap-4 font-medium mt-4 bg-slate-50 rounded-xl border-2 border-gray-100">
            <span className='font-bold'>Buy stSTX on Bitflow</span>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="text-gray-600 place-content-start">

                APY
                <button type="button" onClick={() => { setShowApyInfo(true)}} className="flex text-gray-400">
                  <div className='text-sm'>
                    Includes a 5% performance fee
                  </div>
                  <div className='pt-0.5 pl-1'>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-4 h-4 text-opacity-60" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 11-26 26 26 26 0 0126-26zm48 226h-88a16 16 0 010-32h28v-88h-16a16 16 0 010-32h32a16 16 0 0116 16v104h28a16 16 0 010 32z"></path>
                    </svg>
                  </div>
                </button>

              </div>
              <div className="flex place-content-start sm:place-content-end mt-0 sm:mt-0">
                <span className="text-ststx font-bold">~{stackingApy}%</span>
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
                    <span>
                      ~{stxReceivedBitflow.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {' '}stSTX
                    </span>
                  </div>
                </div>
              </>
            )}
            <button
              type="button"
              className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg ${buttonDisabled ? 'bg-gray-400' : 'button-ststx'} text-white active:bg-button-active hover:bg-button-hover w-full mt-4`}
              disabled={buttonDisabled}
              onClick={buyStStx}
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
