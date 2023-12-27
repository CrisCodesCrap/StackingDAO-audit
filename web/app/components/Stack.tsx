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

  const updateAmount = (event: { target: { value: SetStateAction<string>; }; }) => {
    const amount = event.target.value;
    setAmount(amount);
    setAmountInDollars(stxPrice * event.target.value);
    setStStxReceived(event.target.value / stxRatio);
    const maxBalance = (stxBalance - 2);

    if (amount > maxBalance) {
      setButtonText("Insufficient Balance");
      setButtonDisabled(true);
    } else {
      setButtonText("Stack");
      setButtonDisabled(!amount || !stxAddress || amount > maxBalance);
    }
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

      <div className="sm:pt-0 pt-12 absolute min-h-screen top-0 left-0 bottom-[-80px] z-[49] bg-page-bg w-full md:relative md:min-h-full md:z-0 flex flex-col px-2 overflow-y-auto md:max-w-xl items-center mb-20">
        <div className="py-3 px-6 flex w-full font-medium text-2xl md:text-4xl md:px-0 gap-3.5 items-center justify-start">
          <Link href="/">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-ststx" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <span className="flex-grow">Stack</span>
          <button type="button" className="md:hidden">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="w-6 h-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"></path>
            </svg>
          </button>
        </div>
        <div className="p-2 pt-0 w-full border-2 rounded-xl p-4">
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
              <img alt="Input asset icon" loading="lazy" width="48" height="48" decoding="async" data-nimg="1" className="rounded-full" src="/stacks-stx-logo.png" style={{color: 'transparent'}} />
              <div className="flex-grow text-xl">
                Stacks
                <span className="text-tertiary-text text-base block">Balance: {stxBalance.toLocaleString()} STX</span>
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
            <div className="flex justify-between items-start">
              <div>
                APY
                <button type="button" onClick={() => { setShowApyInfo(true)}} className="text-base flex items-center text-ststx">
                  The APY includes a 5% performance fee
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-4 h-4 text-opacity-60" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 11-26 26 26 26 0 0126-26zm48 226h-88a16 16 0 010-32h28v-88h-16a16 16 0 010-32h32a16 16 0 0116 16v104h28a16 16 0 010 32z"></path>
                  </svg>
                </button>
              </div>
              <span className="text-ststx">~{stackingApy}%</span>
            </div>
            <div className="flex justify-between items-start">
              Conversion rate<span>1 stSTX = {stxRatio} STX</span>
            </div>
            <div className="flex justify-between items-start">
              You receive<span>~{stStxReceived.toLocaleString()} stSTX</span>
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
      </div>
    </>
  )
}
