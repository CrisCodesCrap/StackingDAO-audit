// @ts-nocheck

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAppContext } from './AppContext'
import { useConnect } from '@stacks/connect-react';
import {
  uintCV,
  contractPrincipalCV,
  someCV,
  standardPrincipalCV,
  noneCV,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  makeContractFungiblePostCondition,
  createAssetInfo
} from '@stacks/transactions';
import { useSTXAddress } from '../common/use-stx-address';
import { CommissionModal } from './CommissionModal';
import { useSearchParams } from 'next/navigation'
import { stacksNetwork, resolveProvider } from '../common/utils';

export function Stack() {
  const stxAddress = useSTXAddress();
  const { doContractCall } = useConnect();
  const searchParams = useSearchParams();
  const referral = searchParams.get('referral');

  const { stStxBalance, stxBalance, stxPrice, stxRatio, stackingApy, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const [amount, setAmount] = useState<string | undefined>('');
  const [amountInDollars, setAmountInDollars] = useState<number | undefined>(0);
  const [stStxReceived, setStStxReceived] = useState<number | undefined>(0);
  const [showApyInfo, setShowApyInfo] = useState(false);
  const [buttonText, setButtonText] = useState('Stack');
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const setAmounts = (amount: number) => {
    setAmount(amount);
    setAmountInDollars(stxPrice * amount);
    setStStxReceived(amount / stxRatio);
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

  const maxClicked = () => {
    const amount = (stxBalance - 2).toFixed(2);
    setAmount(amount);
    setAmountInDollars(stxPrice * amount);
    setStStxReceived(amount / stxRatio);

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

    await doContractCall({
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
      onFinish: async data => {
        setAmounts(0);
        setCurrentTxId(data.txId);
        setCurrentTxStatus('pending');
      }
    }, resolveProvider() || window.StacksProvider);
  };

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
          <div className="bg-white rounded-xl w-full p-4 flex flex-col gap-4 font-medium mt-2">

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
          </div>
          <div className='p-2'>
            <button
              type="button"
              className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg ${buttonDisabled ? 'bg-gray-400' : 'button-ststx'} text-white active:bg-button-active hover:bg-button-hover w-full mt-4`}
              disabled={buttonDisabled}
              onClick={stackStx}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
