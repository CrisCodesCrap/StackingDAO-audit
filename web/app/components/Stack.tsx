// @ts-nocheck

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAppContext } from './AppContext/AppContext';
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
  makeStandardSTXPostCondition,
} from '@stacks/transactions';
import { useSTXAddress } from '../common/use-stx-address';
import { CommissionModal } from './CommissionModal';
import { useSearchParams } from 'next/navigation';
import { stacksNetwork } from '../common/utils';
import { StacksMainnet } from '@stacks/network';
import { makeContractCall } from '../common/contract-call';
import { Stats } from './Stats';
import { PoX } from './PoX';
import StxLogo from './Logos/Stx';
import StStxLogo from './Logos/StStx';

export function Stack() {
  const stxAddress = useSTXAddress();
  const searchParams = useSearchParams();
  const referral = searchParams.get('referral');

  const {
    stStxBalance,
    stxBalance,
    stxPrice,
    stxRatio,
    stackingApy,
    setCurrentTxId,
    setCurrentTxStatus,
  } = useAppContext();
  const [amount, setAmount] = useState<string | undefined>('');
  const [amountInDollars, setAmountInDollars] = useState<number | undefined>(0);
  const [stStxReceived, setStStxReceived] = useState<number | undefined>(0);
  const [showApyInfo, setShowApyInfo] = useState(false);
  const [buttonText, setButtonText] = useState('Confirm Stack');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [bitflowRatio, setBitflowRatio] = useState(0);
  const [isLoadingBitflowData, setLoadingBitflowData] = useState(true);
  const [stxReceivedBitflow, setStxReceivedBitflow] = useState<number | undefined>(0);

  const setAmounts = async (amount: number) => {
    setAmount(amount);
    setAmountInDollars(stxPrice * amount);
    setStStxReceived(amount / stxRatio);
    // setStxReceivedBitflow(await bitflowOut(amount));

    const maxBalance = stxBalance - 2;
    if (amount > maxBalance) {
      setButtonText('Insufficient Balance');
      setButtonDisabled(true);
    } else {
      setButtonText('Confirm Stack');
      setButtonDisabled(!amount || !stxAddress || amount > maxBalance);
    }
  };

  const updateAmount = (event: { target: { value: SetStateAction<string> } }) => {
    setAmounts(event.target.value);
  };

  useEffect(() => {
    if (referral) localStorage.setItem('stacking-referral', referral);
  }, [referral]);

  const buyStStx = async () => {
    window.open('https://app.bitflow.finance/trade', '_blank', 'noreferrer');
  };

  const maxClicked = async () => {
    const amount = (stxBalance - 2).toFixed(2);
    setAmount(amount);
    setAmountInDollars(stxPrice * amount);
    setStStxReceived(amount / stxRatio);
    // setStxReceivedBitflow(await bitflowOut(amount));

    setButtonText('Confirm Stack');
    setButtonDisabled(false);
  };

  const stackStx = async () => {
    const stxAmount = Number(amount) * 1000000;
    const stStxAmount = Number(stStxReceived) * 1000000 * 0.98;
    const postConditions = [
      makeStandardSTXPostCondition(stxAddress!, FungibleConditionCode.LessEqual, stxAmount),
    ];

    let referralParam = noneCV();
    if (referral || localStorage.getItem('stacking-referral')) {
      referralParam = someCV(
        standardPrincipalCV(referral || localStorage.getItem('stacking-referral'))
      );
    }

    await makeContractCall(
      {
        stxAddress: stxAddress,
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'stacking-dao-core-v1',
        functionName: 'deposit',
        functionArgs: [
          contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1'),
          uintCV(stxAmount),
          referralParam,
        ],
        postConditions,
        network: stacksNetwork,
      },
      async (error?, txId?) => {
        setAmounts(0);
        setCurrentTxId(txId);
        setCurrentTxStatus('pending');
      }
    );
  };

  const bitflowOut = async (amountIn: number) => {
    setLoadingBitflowData(true);
    const resultOut = await callReadOnlyFunction({
      contractAddress: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
      contractName: 'stableswap-stx-ststx-v-1-2',
      functionName: 'get-dy',
      functionArgs: [
        contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, 'ststx-token'),
        contractPrincipalCV('SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M', 'stx-ststx-lp-token-v-1-2'),
        uintCV(amountIn * 1000000),
      ],
      senderAddress: stxAddress,
      // Hiro API gives read error. This endpoint is from Bitflow.
      network: new StacksMainnet({
        url: 'https://anm8bm7vhj.execute-api.us-east-2.amazonaws.com/mainnet/',
      }),
    });
    const out = cvToJSON(resultOut).value.value / 1000000;
    setLoadingBitflowData(false);
    return out;
  };

  const bitflowRate = async () => {
    const out = await bitflowOut(1);
    setBitflowRatio(Number(out));
  };

  return (
    <>
      {showApyInfo && <CommissionModal open={showApyInfo} setOpen={setShowApyInfo} />}

      <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">
        <div className="p-8 md:p-12 bg-white rounded-xl flex items-center justify-center shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
          <div className="flex flex-col w-full min-h-full md:max-w-xl">
            <div className="flex items-center justify-start w-full gap-2 text-2xl md:text-2xl">
              <Link href="/">
                <svg
                  lassName="text-dark-green-600"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21L3 12L12 3"
                    stroke="#1D3730"
                    stroke-width="3"
                    stroke-linecap="square"
                    stroke-linejoin="bevel"
                  />
                  <path
                    d="M21 12H6"
                    stroke="#1D3730"
                    stroke-width="3"
                    stroke-linecap="square"
                    stroke-linejoin="round"
                  />
                </svg>
              </Link>
              <span className="flex-grow text-sd-gray-darker font-headings">Stack</span>
            </div>
            <div className="w-full mt-6">
              <div className="w-full p-6 overflow-x-hidden font-medium rounded-lg bg-sd-gray-light">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="block text-sm text-sd-gray">Balance</span>
                    <div className="flex text-base items-center gap-1.5">
                      {stxBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                      <StxLogo className="inline w-4 h-4" />
                    </div>
                  </div>
                  <div className="">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-fluor-green-500 bg-dark-green-600"
                      onClick={() => maxClicked()}
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div className="relative flex flex-col items-center max-w-full mt-6 mb-5 overflow-x-clip">
                  <div className="relative">
                    <div className="inline-block w-full text-5xl text-center">
                      <input
                        autoFocus
                        placeholder="0.0"
                        min="0"
                        className="!outline-none text-center bg-sd-gray-light"
                        inputMode="numeric"
                        type="text"
                        value={amount}
                        onChange={evt => updateAmount(evt)}
                      />
                    </div>
                  </div>
                  <span className="text-sd-gray">~${amountInDollars.toLocaleString('en-US')}</span>
                </div>
              </div>

              <div className="flex flex-col w-full gap-4 p-6 mt-4 font-medium rounded-lg bg-sd-gray-light">
                <div className="grid grid-cols-1 sm:grid-flow-col">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sd-gray">APY</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowApyInfo(true);
                      }}
                      className="bg-sd-gray/[.08] shrink-0 rounded text-sd-gray px-1.5 py-1 text-xs flex items-center gap-1 border border-transparent hover:border-sd-gray/20"
                    >
                      Includes a 5% performance fee
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none">
                        <g
                          stroke="#797C80"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          clip-path="url(#clip0_321_1078)"
                        >
                          <path d="M6 11c2.76142 0 5-2.23858 5-5S8.76142 1 6 1 1 3.23858 1 6s2.23858 5 5 5Z" />
                          <path d="M4.54504 4.50004c.11756-.33417.34958-.61595.65498-.79543.3054-.17949.66447-.2451 1.01361-.18521.34914.05988.66582.2414.89395.5124.22813.27101.35299.614.35246.96824 0 1-1.5 1.5-1.5 1.5M6 8.5h.00556" />
                        </g>
                        <defs>
                          <clipPath id="clip0_321_1078">
                            <path fill="#fff" d="M0 0h12v12H0z" />
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                  </div>
                  <div className="flex place-content-start sm:place-content-end">
                    <span className="font-semibold">~{stackingApy}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="text-sd-gray">Conversion rate</div>
                  <div className="flex mt-0 place-content-start sm:place-content-end sm:mt-0">
                    <div className="flex items-center font-semibold">
                      1 <StStxLogo className="mx-1.5 inline w-5 h-5" />= {stxRatio}{' '}
                      <StxLogo className="ml-1.5 inline w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="text-sd-gray">You receive</div>
                  <div className="flex items-center mt-0 place-content-start sm:place-content-end sm:mt-0">
                    ~
                    {stStxReceived.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <StStxLogo className="ml-1.5 inline w-5 h-5" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="flex gap-2 mt-6 items-center justify-center rounded-lg px-6 font-semibold focus:outline-none min-h-[56px] text-xl bg-dark-green-600 text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full"
                disabled={buttonDisabled}
                onClick={stackStx}
              >
                {buttonText}
              </button>

              {/*          <div className="flex flex-col w-full gap-4 p-4 mt-4 font-medium bg-white border-2 border-gray-100 rounded-xl bg-slate-50">
                <span className='font-bold'>Buy stSTX on Bitflow</span>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="text-sd-gray place-content-start">

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
                  <div className="flex mt-0 place-content-start sm:place-content-end sm:mt-0">
                    <span className="font-bold text-ststx">~{stackingApy}%</span>
                  </div>
                </div>

                {isLoadingBitflowData ? (
                  <div role="status" className="flex flex-col items-center mt-4 text-center">
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-green-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      <div className="text-sd-gray">
                        Conversion rate
                      </div>
                      <div className="flex mt-0 place-content-start sm:place-content-end sm:mt-0">
                        1 stSTX = {' '}
                        {bitflowRatio.toLocaleString('en-US', {
                          maximumFractionDigits: 6,
                        })}
                        {' '} STX
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      <div className="text-sd-gray">
                        You receive
                      </div>
                      <div className="flex mt-0 place-content-start sm:place-content-end sm:mt-0">
                        <span>
                          ~{stxReceivedBitflow.toLocaleString('en-US', {
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
              </div>*/}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-dark-green-600 rounded-xl shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
          <div className="flex flex-col">
            <Stats />
            <PoX />
          </div>
        </div>
      </div>
    </>
  );
}
