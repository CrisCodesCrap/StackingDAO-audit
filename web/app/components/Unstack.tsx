// @ts-nocheck

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext/AppContext';
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
  cvToJSON,
} from '@stacks/transactions';
import { Alert } from './Alert';
import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from '@stacks/network';
import { stacksNetwork, formatSeconds } from '../common/utils';
import { makeContractCall } from '../common/contract-call';
import { Stats } from './Stats';
import { PoX } from './PoX';
import { Tooltip } from 'react-tooltip';
import { PlaceholderBar } from './PlaceholderBar';

export function Unstack() {
  const stxAddress = useSTXAddress();

  const {
    stStxBalance,
    stxPrice,
    stxRatio,
    bitcoinBlocksLeft,
    setCurrentTxId,
    setCurrentTxStatus,
  } = useAppContext();
  const [amount, setAmount] = useState<string | undefined>('');
  const [amountInDollars, setAmountInDollars] = useState<number | undefined>(0);
  const [stxReceived, setStxReceived] = useState<number | undefined>(0);
  const [buttonText, setButtonText] = useState('Unstack');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [bitflowRatio, setBitflowRatio] = useState(0);
  const [stxReceivedBitflow, setStxReceivedBitflow] = useState<number | undefined>(0);
  const [isLoadingBitflowData, setLoadingBitflowData] = useState(true);

  const updateAmount = async (event: { target: { value: SetStateAction<string> } }) => {
    const amount = event.target.value;
    setAmount(amount);
    setAmountInDollars((stxPrice * stxRatio * event.target.value).toFixed(2));
    setStxReceived(stxRatio * event.target.value);
    setStxReceivedBitflow(await bitflowOut(Number(event.target.value)));

    if (amount > stStxBalance) {
      setButtonText('Insufficient Balance');
      setButtonDisabled(true);
    } else {
      setButtonText('Unstack');
      setButtonDisabled(!amount || !stxAddress || amount > stStxBalance);
    }
  };

  const maxClicked = async () => {
    const amount = stStxBalance;
    setAmount(amount);
    setAmountInDollars((stxPrice * stxRatio * amount).toFixed(2));
    setStxReceived(stxRatio * amount);
    setStxReceivedBitflow(await bitflowOut(amount));

    setButtonText('Unstack');
    setButtonDisabled(false);
  };

  const sellStStx = async () => {
    window.open('https://app.bitflow.finance/trade', '_blank', 'noreferrer');
  };

  const unstackStx = async () => {
    const stStxAmount = Number(amount) * 1000000;
    const postConditions = [
      createFungiblePostCondition(
        stxAddress!,
        FungibleConditionCode.LessEqual,
        uintCV(stStxAmount).value,
        createAssetInfo(process.env.NEXT_PUBLIC_STSTX_ADDRESS, 'ststx-token', 'ststx')
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
      ),
    ];

    await makeContractCall(
      {
        stxAddress: stxAddress,
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'stacking-dao-core-v1',
        functionName: 'init-withdraw',
        functionArgs: [
          contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS, 'reserve-v1'),
          uintCV(stStxAmount),
        ],
        postConditionMode: 0x01,
        network: stacksNetwork,
      },
      async (error?, txId?) => {
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
      functionName: 'get-dx',
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

  useEffect(() => {
    if (stxAddress) bitflowRate();
  }, [stxAddress]);

  return (
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
            <span className="flex-grow text-sd-gray-darker font-headings">Unstack</span>
          </div>

          <div className="w-full mt-6">
            <div className="w-full p-6 bg-sd-gray-light rounded-lg overflow-x-hidden font-medium">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="block text-sm text-sd-gray">Stacked balance</span>
                  <div className="flex text-base items-center gap-1.5">
                    {stStxBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="8" cy="8" r="8" fill="#1E3731" />
                      <path
                        d="M9.5873 9.51785L11.3212 12.225H10.0259L7.99042 9.04428L5.95494 12.225H4.66648L6.40041 9.52489H3.9126V8.5H12.0751V9.51785H9.5873Z"
                        fill="#7BF179"
                      />
                      <path
                        d="M12.1126 6.46202V7.49279V7.4999H3.9126V6.46202H6.36365L4.6424 3.7749H5.94367L8.00916 7.0165L10.0816 3.7749H11.3828L9.66157 6.46202H12.1126Z"
                        fill="#7BF179"
                      />
                    </svg>
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

            <div className="flex flex-col w-full gap-4 p-6 mt-4 font-medium bg-sd-gray-light rounded-lg">
              <h4 className="font-base font semibold">Unstack from PoX</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-sd-gray">Time to receive STX</p>
                </div>
                <div className="flex place-content-start sm:place-content-end">
                  <p className="relative flex items-center gap-1 group max-w-max">
                    {Number(bitcoinBlocksLeft) <= 100 ? (
                      <span>
                        End of cycle{' '}
                        <svg
                          className="inline"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_431_1934)">
                            <path
                              opacity="0.5"
                              d="M6.99996 12.8334C10.2216 12.8334 12.8333 10.2217 12.8333 7.00008C12.8333 3.77842 10.2216 1.16675 6.99996 1.16675C3.7783 1.16675 1.16663 3.77842 1.16663 7.00008C1.16663 10.2217 3.7783 12.8334 6.99996 12.8334Z"
                              stroke="#00060F"
                              stroke-width="1.16667"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              opacity="0.5"
                              d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                              stroke="#00060F"
                              stroke-width="1.16667"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              opacity="0.5"
                              d="M7 9.91675H7.00648"
                              stroke="#00060F"
                              stroke-width="1.16667"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_431_1934">
                              <rect width="14" height="14" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="text-sd-gray-darker/50 block text-sm">
                          (~
                          {formatSeconds(21000 + 10 * bitcoinBlocksLeft).toLocaleString('en-US')})
                        </span>
                      </span>
                    ) : (
                      <>
                        <Tooltip anchorSelect="#endOfCycle" place="top" className="max-w-xs">
                          The STX that is backing your stSTX is locked in Stacks consensus in 2-week
                          cycles. STX can only be unstacked by Stacking DAO at the end of a Stacks
                          Consensus cycle.
                        </Tooltip>

                        <span id="endOfCycle">
                          End of cycle{' '}
                          <svg
                            className="inline"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_431_1934)">
                              <path
                                opacity="0.5"
                                d="M6.99996 12.8334C10.2216 12.8334 12.8333 10.2217 12.8333 7.00008C12.8333 3.77842 10.2216 1.16675 6.99996 1.16675C3.7783 1.16675 1.16663 3.77842 1.16663 7.00008C1.16663 10.2217 3.7783 12.8334 6.99996 12.8334Z"
                                stroke="#00060F"
                                stroke-width="1.16667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                opacity="0.5"
                                d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                                stroke="#00060F"
                                stroke-width="1.16667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                opacity="0.5"
                                d="M7 9.91675H7.00648"
                                stroke="#00060F"
                                stroke-width="1.16667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_431_1934">
                                <rect width="14" height="14" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <span className="text-sd-gray-darker/50 block text-sm">
                            (~
                            {formatSeconds(10 * bitcoinBlocksLeft).toLocaleString('en-US')})
                          </span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="text-sd-gray">Conversion rate</div>
                <div className="flex mt-0 place-content-start sm:place-content-end sm:mt-0">
                  <div className="flex items-center font-semibold">
                    1{' '}
                    <svg
                      className="ml-1.5 mr-2 inline"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="8" cy="8" r="8" fill="#1E3731" />
                      <path
                        d="M10.8115 6.60614L10.5377 6.38668C10.2193 6.13145 9.82742 5.99297 9.42392 5.99297H5.73961V4.3999H9.42358C10.1717 4.3999 10.8983 4.65688 11.4884 5.12982L11.7619 5.34894L10.8115 6.60614Z"
                        fill="#7BF179"
                      />
                      <path
                        d="M8.75079 11.5999H6.33828C5.59018 11.5999 4.86353 11.3429 4.27343 10.87L4 10.6509L4.9507 9.39366L5.22413 9.61313C5.54251 9.86835 5.93478 10.0072 6.33828 10.0072H8.75079V11.5999Z"
                        fill="#7BF179"
                      />
                      <path
                        d="M9.27694 7.20355H6.91517C6.26684 7.20355 5.73961 6.66048 5.73961 5.99297L4.19212 5.99297C4.19212 7.53906 5.41386 8.79661 6.91517 8.79661H9.27694C9.92528 8.79661 10.4527 9.33967 10.4527 10.0072H12C12 8.4611 10.7783 7.20355 9.27694 7.20355Z"
                        fill="#7BF179"
                      />
                    </svg>
                    = {stxRatio}{' '}
                    <svg
                      className="inline ml-1"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="8" cy="8" r="8" fill="#514CF6" />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M9.42528 6.62032C9.39464 6.56817 9.39904 6.50299 9.43404 6.45084L10.8966 4.29984C10.936 4.239 10.9404 4.16513 10.9053 4.10429C10.8703 4.03911 10.8046 4.00435 10.7346 4.00435H10.1653C10.104 4.00435 10.0427 4.03476 10.0033 4.09126L8.29556 6.61163C8.2518 6.67681 8.18172 6.71157 8.10291 6.71157H7.88835C7.80953 6.71157 7.73947 6.67246 7.69568 6.61163L5.99672 4.08691C5.96169 4.03042 5.89601 4 5.8347 4H5.26546C5.1954 4 5.12534 4.03911 5.09469 4.10429C5.05966 4.16947 5.06842 4.24335 5.10345 4.29984L6.56596 6.45519C6.60099 6.50299 6.60537 6.56817 6.57472 6.62032C6.54407 6.67681 6.49152 6.70723 6.43022 6.70723H4.19267C4.0832 6.70723 4 6.79414 4 6.89843V7.36774C4 7.47638 4.08758 7.55894 4.19267 7.55894H11.8074C11.9168 7.55894 12 7.47203 12 7.36774V6.89843C12 6.79848 11.9256 6.72026 11.8292 6.70723C11.8205 6.70723 11.8117 6.70723 11.803 6.70723H9.5698C9.50848 6.70723 9.45156 6.67681 9.42528 6.62032ZM7.70006 9.38839L5.99234 11.9088C5.95731 11.9652 5.89163 11.9957 5.83032 11.9957H5.26108C5.19102 11.9957 5.12534 11.9565 5.09031 11.8957C5.05528 11.8349 5.05966 11.7567 5.09907 11.7002L6.5572 9.54917C6.59223 9.49703 6.59661 9.43617 6.56596 9.37971C6.53531 9.32753 6.48276 9.29279 6.42146 9.29279H4.19267C4.08758 9.29279 4 9.2102 4 9.10156V8.63227C4 8.52799 4.0832 8.44108 4.19267 8.44108H11.7898C11.7898 8.44108 11.803 8.44108 11.8074 8.44108C11.9124 8.44108 12 8.52363 12 8.63227V9.10156C12 9.20588 11.9168 9.29279 11.8074 9.29279H9.57416C9.50848 9.29279 9.45596 9.32321 9.42968 9.37971C9.39904 9.43617 9.4034 9.49703 9.43844 9.54481L10.901 11.7002C10.936 11.7567 10.9447 11.8305 10.9097 11.8957C10.8747 11.9609 10.809 12 10.7389 12H10.1697C10.104 12 10.0471 11.9696 10.012 11.9174L8.30432 9.39707C8.26055 9.33189 8.19047 9.29712 8.11167 9.29712H7.8971C7.81829 9.29712 7.74823 9.33625 7.70444 9.39707L7.70006 9.38839Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="text-sd-gray">You receive</div>
                <div className="flex items-center mt-0 place-content-start sm:place-content-end sm:mt-0">
                  {stxReceived.toLocaleString('en-US')}
                  <svg
                    className="inline ml-1"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="8" cy="8" r="8" fill="#514CF6" />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M9.42528 6.62032C9.39464 6.56817 9.39904 6.50299 9.43404 6.45084L10.8966 4.29984C10.936 4.239 10.9404 4.16513 10.9053 4.10429C10.8703 4.03911 10.8046 4.00435 10.7346 4.00435H10.1653C10.104 4.00435 10.0427 4.03476 10.0033 4.09126L8.29556 6.61163C8.2518 6.67681 8.18172 6.71157 8.10291 6.71157H7.88835C7.80953 6.71157 7.73947 6.67246 7.69568 6.61163L5.99672 4.08691C5.96169 4.03042 5.89601 4 5.8347 4H5.26546C5.1954 4 5.12534 4.03911 5.09469 4.10429C5.05966 4.16947 5.06842 4.24335 5.10345 4.29984L6.56596 6.45519C6.60099 6.50299 6.60537 6.56817 6.57472 6.62032C6.54407 6.67681 6.49152 6.70723 6.43022 6.70723H4.19267C4.0832 6.70723 4 6.79414 4 6.89843V7.36774C4 7.47638 4.08758 7.55894 4.19267 7.55894H11.8074C11.9168 7.55894 12 7.47203 12 7.36774V6.89843C12 6.79848 11.9256 6.72026 11.8292 6.70723C11.8205 6.70723 11.8117 6.70723 11.803 6.70723H9.5698C9.50848 6.70723 9.45156 6.67681 9.42528 6.62032ZM7.70006 9.38839L5.99234 11.9088C5.95731 11.9652 5.89163 11.9957 5.83032 11.9957H5.26108C5.19102 11.9957 5.12534 11.9565 5.09031 11.8957C5.05528 11.8349 5.05966 11.7567 5.09907 11.7002L6.5572 9.54917C6.59223 9.49703 6.59661 9.43617 6.56596 9.37971C6.53531 9.32753 6.48276 9.29279 6.42146 9.29279H4.19267C4.08758 9.29279 4 9.2102 4 9.10156V8.63227C4 8.52799 4.0832 8.44108 4.19267 8.44108H11.7898C11.7898 8.44108 11.803 8.44108 11.8074 8.44108C11.9124 8.44108 12 8.52363 12 8.63227V9.10156C12 9.20588 11.9168 9.29279 11.8074 9.29279H9.57416C9.50848 9.29279 9.45596 9.32321 9.42968 9.37971C9.39904 9.43617 9.4034 9.49703 9.43844 9.54481L10.901 11.7002C10.936 11.7567 10.9447 11.8305 10.9097 11.8957C10.8747 11.9609 10.809 12 10.7389 12H10.1697C10.104 12 10.0471 11.9696 10.012 11.9174L8.30432 9.39707C8.26055 9.33189 8.19047 9.29712 8.11167 9.29712H7.8971C7.81829 9.29712 7.74823 9.33625 7.70444 9.39707L7.70006 9.38839Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>

              <Alert type={Alert.type.WARNING} className="rounded-full">
                <p>
                  Unstacking STX will give you a withdrawal NFT that allows you to withdraw the STX
                  tokens after the current PoX yield cycle ends.
                </p>
                <p className="mt-2">
                  <a
                    className="font-bold"
                    href="https://docs.stackingdao.com/stackingdao/the-stacking-dao-app/withdrawing-stx"
                    target="_blank"
                  >
                    Learn more about withdrawals
                  </a>
                </p>
              </Alert>

              <button
                type="button"
                className="flex gap-2 items-center justify-center rounded-lg px-6 font-semibold focus:outline-none min-h-[48px] text-xl bg-dark-green-600 text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full"
                disabled={buttonDisabled}
                onClick={unstackStx}
              >
                {buttonText}
              </button>
            </div>

            <div className="flex flex-col w-full gap-4 p-6 mt-4 font-medium bg-sd-gray-light rounded-lg">
              <h4 className="font-base font semibold">Sell stSTX on Bitflow</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="text-sd-gray">Time to receive STX</div>
                <div className="flex mt-0 place-content-start sm:place-content-end sm:mt-0">
                  Instant
                </div>
              </div>

              {isLoadingBitflowData ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <PlaceholderBar className="w-20 inline-flex h-4" />
                    <PlaceholderBar
                      className="w-20 inline-flex h-4 sm:justify-self-end"
                      color={PlaceholderBar.color.GRAY}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <PlaceholderBar className="w-20 inline-flex h-4" />
                    <PlaceholderBar
                      className="w-20 inline-flex h-4 sm:justify-self-end"
                      color={PlaceholderBar.color.GRAY}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="text-sd-gray">Conversion rate</div>
                    <div className="flex mt-0 place-content-start sm:place-content-end sm:mt-0">
                      <div className="flex items-center font-semibold">
                        1{' '}
                        <svg
                          className="ml-1.5 mr-2 inline"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="8" fill="#1E3731" />
                          <path
                            d="M10.8115 6.60614L10.5377 6.38668C10.2193 6.13145 9.82742 5.99297 9.42392 5.99297H5.73961V4.3999H9.42358C10.1717 4.3999 10.8983 4.65688 11.4884 5.12982L11.7619 5.34894L10.8115 6.60614Z"
                            fill="#7BF179"
                          />
                          <path
                            d="M8.75079 11.5999H6.33828C5.59018 11.5999 4.86353 11.3429 4.27343 10.87L4 10.6509L4.9507 9.39366L5.22413 9.61313C5.54251 9.86835 5.93478 10.0072 6.33828 10.0072H8.75079V11.5999Z"
                            fill="#7BF179"
                          />
                          <path
                            d="M9.27694 7.20355H6.91517C6.26684 7.20355 5.73961 6.66048 5.73961 5.99297L4.19212 5.99297C4.19212 7.53906 5.41386 8.79661 6.91517 8.79661H9.27694C9.92528 8.79661 10.4527 9.33967 10.4527 10.0072H12C12 8.4611 10.7783 7.20355 9.27694 7.20355Z"
                            fill="#7BF179"
                          />
                        </svg>
                        = {stxRatio}{' '}
                        <svg
                          className="inline ml-1"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="8" fill="#514CF6" />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M9.42528 6.62032C9.39464 6.56817 9.39904 6.50299 9.43404 6.45084L10.8966 4.29984C10.936 4.239 10.9404 4.16513 10.9053 4.10429C10.8703 4.03911 10.8046 4.00435 10.7346 4.00435H10.1653C10.104 4.00435 10.0427 4.03476 10.0033 4.09126L8.29556 6.61163C8.2518 6.67681 8.18172 6.71157 8.10291 6.71157H7.88835C7.80953 6.71157 7.73947 6.67246 7.69568 6.61163L5.99672 4.08691C5.96169 4.03042 5.89601 4 5.8347 4H5.26546C5.1954 4 5.12534 4.03911 5.09469 4.10429C5.05966 4.16947 5.06842 4.24335 5.10345 4.29984L6.56596 6.45519C6.60099 6.50299 6.60537 6.56817 6.57472 6.62032C6.54407 6.67681 6.49152 6.70723 6.43022 6.70723H4.19267C4.0832 6.70723 4 6.79414 4 6.89843V7.36774C4 7.47638 4.08758 7.55894 4.19267 7.55894H11.8074C11.9168 7.55894 12 7.47203 12 7.36774V6.89843C12 6.79848 11.9256 6.72026 11.8292 6.70723C11.8205 6.70723 11.8117 6.70723 11.803 6.70723H9.5698C9.50848 6.70723 9.45156 6.67681 9.42528 6.62032ZM7.70006 9.38839L5.99234 11.9088C5.95731 11.9652 5.89163 11.9957 5.83032 11.9957H5.26108C5.19102 11.9957 5.12534 11.9565 5.09031 11.8957C5.05528 11.8349 5.05966 11.7567 5.09907 11.7002L6.5572 9.54917C6.59223 9.49703 6.59661 9.43617 6.56596 9.37971C6.53531 9.32753 6.48276 9.29279 6.42146 9.29279H4.19267C4.08758 9.29279 4 9.2102 4 9.10156V8.63227C4 8.52799 4.0832 8.44108 4.19267 8.44108H11.7898C11.7898 8.44108 11.803 8.44108 11.8074 8.44108C11.9124 8.44108 12 8.52363 12 8.63227V9.10156C12 9.20588 11.9168 9.29279 11.8074 9.29279H9.57416C9.50848 9.29279 9.45596 9.32321 9.42968 9.37971C9.39904 9.43617 9.4034 9.49703 9.43844 9.54481L10.901 11.7002C10.936 11.7567 10.9447 11.8305 10.9097 11.8957C10.8747 11.9609 10.809 12 10.7389 12H10.1697C10.104 12 10.0471 11.9696 10.012 11.9174L8.30432 9.39707C8.26055 9.33189 8.19047 9.29712 8.11167 9.29712H7.8971C7.81829 9.29712 7.74823 9.33625 7.70444 9.39707L7.70006 9.38839Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="text-sd-gray">You receive</div>
                    <div className="flex items-center mt-0 place-content-start sm:place-content-end sm:mt-0">
                      ~{stxReceivedBitflow.toLocaleString('en-US')}
                      <svg
                        className="inline ml-1"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="8" cy="8" r="8" fill="#514CF6" />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M9.42528 6.62032C9.39464 6.56817 9.39904 6.50299 9.43404 6.45084L10.8966 4.29984C10.936 4.239 10.9404 4.16513 10.9053 4.10429C10.8703 4.03911 10.8046 4.00435 10.7346 4.00435H10.1653C10.104 4.00435 10.0427 4.03476 10.0033 4.09126L8.29556 6.61163C8.2518 6.67681 8.18172 6.71157 8.10291 6.71157H7.88835C7.80953 6.71157 7.73947 6.67246 7.69568 6.61163L5.99672 4.08691C5.96169 4.03042 5.89601 4 5.8347 4H5.26546C5.1954 4 5.12534 4.03911 5.09469 4.10429C5.05966 4.16947 5.06842 4.24335 5.10345 4.29984L6.56596 6.45519C6.60099 6.50299 6.60537 6.56817 6.57472 6.62032C6.54407 6.67681 6.49152 6.70723 6.43022 6.70723H4.19267C4.0832 6.70723 4 6.79414 4 6.89843V7.36774C4 7.47638 4.08758 7.55894 4.19267 7.55894H11.8074C11.9168 7.55894 12 7.47203 12 7.36774V6.89843C12 6.79848 11.9256 6.72026 11.8292 6.70723C11.8205 6.70723 11.8117 6.70723 11.803 6.70723H9.5698C9.50848 6.70723 9.45156 6.67681 9.42528 6.62032ZM7.70006 9.38839L5.99234 11.9088C5.95731 11.9652 5.89163 11.9957 5.83032 11.9957H5.26108C5.19102 11.9957 5.12534 11.9565 5.09031 11.8957C5.05528 11.8349 5.05966 11.7567 5.09907 11.7002L6.5572 9.54917C6.59223 9.49703 6.59661 9.43617 6.56596 9.37971C6.53531 9.32753 6.48276 9.29279 6.42146 9.29279H4.19267C4.08758 9.29279 4 9.2102 4 9.10156V8.63227C4 8.52799 4.0832 8.44108 4.19267 8.44108H11.7898C11.7898 8.44108 11.803 8.44108 11.8074 8.44108C11.9124 8.44108 12 8.52363 12 8.63227V9.10156C12 9.20588 11.9168 9.29279 11.8074 9.29279H9.57416C9.50848 9.29279 9.45596 9.32321 9.42968 9.37971C9.39904 9.43617 9.4034 9.49703 9.43844 9.54481L10.901 11.7002C10.936 11.7567 10.9447 11.8305 10.9097 11.8957C10.8747 11.9609 10.809 12 10.7389 12H10.1697C10.104 12 10.0471 11.9696 10.012 11.9174L8.30432 9.39707C8.26055 9.33189 8.19047 9.29712 8.11167 9.29712H7.8971C7.81829 9.29712 7.74823 9.33625 7.70444 9.39707L7.70006 9.38839Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                className="flex gap-2 items-center justify-center rounded-lg px-6 font-semibold focus:outline-none min-h-[48px] text-xl bg-dark-green-600 text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full"
                disabled={buttonDisabled}
                onClick={sellStStx}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.5396 0H5.46035C2.44506 0 0 2.4448 0 5.4599V10.3775H5.6551C5.24179 9.82835 4.99661 9.14605 4.99661 8.40768C4.99661 6.5975 6.46918 5.12506 8.27955 5.12506C10.0898 5.12506 11.5624 6.5975 11.5624 8.40768C11.5624 8.77056 11.2682 9.06477 10.9053 9.06477C10.5424 9.06477 10.2482 8.77056 10.2482 8.40768C10.2482 7.32192 9.36403 6.43782 8.27808 6.43782C7.19226 6.43782 6.3081 7.32192 6.3081 8.40768C6.3081 9.4935 7.19226 10.3775 8.27808 10.3775H13.859C14.2219 10.3775 14.5162 10.6717 14.5162 11.0346C14.5162 11.3975 14.2219 11.6918 13.859 11.6918H0.123328C0.65152 14.1534 2.84019 16 5.46035 16H10.5396C13.5549 16 16 13.5551 16 10.5401V5.4599C16 2.4448 13.5549 0 10.5396 0ZM13.5451 8.72435C13.1822 8.72435 12.8879 8.43014 12.8879 8.06726C12.8879 5.53274 10.8255 3.47181 8.2921 3.47181C5.75878 3.47181 3.69632 5.53414 3.69632 8.06726C3.69632 8.43014 3.40205 8.72435 3.03917 8.72435C2.67622 8.72435 2.38202 8.43014 2.38202 8.06726C2.38202 4.80838 5.03302 2.15904 8.29075 2.15904C11.5499 2.15904 14.1994 4.80979 14.1994 8.06726C14.1994 8.43014 13.9052 8.72435 13.5423 8.72435H13.5451Z"
                    fill="white"
                  />
                </svg>
                Sell on Bitflow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="p-8 md:p-12 bg-dark-green-600 rounded-xl shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
          <div className="flex flex-col">
            <Stats />
            <PoX />
          </div>
        </div>
      </div>
    </div>
  );
}
