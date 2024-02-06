// @ts-nocheck

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAppContext } from './AppContext'
import { useSTXAddress } from '../common/use-stx-address';
import {
  uintCV,
  contractPrincipalCV,
  FungibleConditionCode,
  createFungiblePostCondition,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode
} from '@stacks/transactions'
import { Alert } from './Alert';
import { useConnect } from '@stacks/connect-react';
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

  const updateAmount = (event: { target: { value: SetStateAction<string>; }; }) => {
    const amount = event.target.value;
    setAmount(amount);
    setAmountInDollars((stxPrice * stxRatio * event.target.value).toFixed(2));
    setStxReceived(stxRatio * event.target.value);

    if (amount > stStxBalance) {
      setButtonText("Insufficient Balance");
      setButtonDisabled(true);
    } else {
      setButtonText("Unstack");
      setButtonDisabled(!amount || !stxAddress || amount > stStxBalance);
    }
  };

  const maxClicked = () => {
    const amount = stStxBalance
    setAmount(amount);
    setAmountInDollars((stxPrice * stxRatio * amount).toFixed(2));
    setStxReceived(stxRatio * amount);

   setButtonText("Unstack");
   setButtonDisabled(false);
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

      <div className='pb-3'>
        <Alert type={Alert.type.WARNING}>
          <p>
            Unstacking STX will give you a withdrawal NFT that allows you to withdraw the STX tokens after the current PoX yield cycle ends.
          </p>
          <p className="mt-2">
            <a className="font-bold" href="https://docs.stackingdao.com/stackingdao/the-stacking-dao-app/withdrawing-stx" target="_blank">Learn more about withdrawals</a>
          </p>
        </Alert>
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
        <div className="bg-white rounded-xl w-full p-4 flex flex-col gap-4 font-medium mt-2">
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
              Best price
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

        </div>
        <div className='p-2'>
          <button
            type="button"
            className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg ${buttonDisabled ? 'bg-gray-400' : 'button-ststx'} text-white active:bg-button-active hover:bg-button-hover w-full mt-4`}
            disabled={buttonDisabled}
            onClick={unstackStx}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
