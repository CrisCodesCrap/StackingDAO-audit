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
import { StacksMainnet } from '@stacks/network';
import { stacksNetwork, formatSeconds, currency } from '../common/utils';
import { makeContractCall } from '../common/contract-call';
import { Stats } from './Stats';
import { PoX } from './PoX';
import { Tooltip } from 'react-tooltip';
import { PlaceholderBar } from './PlaceholderBar';
import StxLogo from './Logos/Stx';
import StStxLogo from './Logos/StStx';

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
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeLinejoin="bevel"
                />
                <path
                  d="M21 12H6"
                  stroke="#1D3730"
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <span className="flex-grow text-sd-gray-darker font-headings">Unstack</span>
          </div>

          <div className="w-full mt-6">
            <div className="w-full p-6 overflow-x-hidden font-medium rounded-lg bg-sd-gray-light">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="block text-sm text-sd-gray">Stacked balance</span>
                  <div className="flex text-base items-center gap-1.5">
                    {currency.long.format(stStxBalance)}
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

            <div className="flex flex-col w-full gap-4 p-6 mt-4 font-medium rounded-lg bg-sd-gray-light">
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
                          <g clipPath="url(#clip0_431_1934)">
                            <path
                              opacity="0.5"
                              d="M6.99996 12.8334C10.2216 12.8334 12.8333 10.2217 12.8333 7.00008C12.8333 3.77842 10.2216 1.16675 6.99996 1.16675C3.7783 1.16675 1.16663 3.77842 1.16663 7.00008C1.16663 10.2217 3.7783 12.8334 6.99996 12.8334Z"
                              stroke="#00060F"
                              strokeWidth="1.16667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              opacity="0.5"
                              d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                              stroke="#00060F"
                              strokeWidth="1.16667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              opacity="0.5"
                              d="M7 9.91675H7.00648"
                              stroke="#00060F"
                              strokeWidth="1.16667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_431_1934">
                              <rect width="14" height="14" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="block text-sm text-sd-gray-darker/50">
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
                            <g clipPath="url(#clip0_431_1934)">
                              <path
                                opacity="0.5"
                                d="M6.99996 12.8334C10.2216 12.8334 12.8333 10.2217 12.8333 7.00008C12.8333 3.77842 10.2216 1.16675 6.99996 1.16675C3.7783 1.16675 1.16663 3.77842 1.16663 7.00008C1.16663 10.2217 3.7783 12.8334 6.99996 12.8334Z"
                                stroke="#00060F"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                opacity="0.5"
                                d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                                stroke="#00060F"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                opacity="0.5"
                                d="M7 9.91675H7.00648"
                                stroke="#00060F"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_431_1934">
                                <rect width="14" height="14" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <span className="block text-sm text-sd-gray-darker/50">
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
                    1 <StStxLogo className="inline mx-1.5 w-5 h-5" />= {stxRatio}{' '}
                    <StxLogo className="inline ml-1.5 w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="text-sd-gray">You receive</div>
                <div className="flex items-center mt-0 place-content-start sm:place-content-end sm:mt-0">
                  {currency.default.format(stxReceived)}
                  <StxLogo className="inline w-5 h-5 ml-1.5" />
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

            <div className="flex flex-col w-full gap-4 p-6 mt-4 font-medium rounded-lg bg-sd-gray-light">
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
                    <PlaceholderBar className="inline-flex w-20 h-4" />
                    <PlaceholderBar
                      className="inline-flex w-20 h-4 sm:justify-self-end"
                      color={PlaceholderBar.color.GRAY}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <PlaceholderBar className="inline-flex w-20 h-4" />
                    <PlaceholderBar
                      className="inline-flex w-20 h-4 sm:justify-self-end"
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
                        1 <StStxLogo className="inline mx-1.5 w-5 h-5" />= {stxRatio}{' '}
                        <StxLogo className="inline w-5 h-5 ml-1.5" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="text-sd-gray">You receive</div>
                    <div className="flex items-center mt-0 place-content-start sm:place-content-end sm:mt-0">
                      ~{currency.default.format(stxReceivedBitflow)}
                      <StxLogo className="inline w-5 h-5 ml-1.5" />
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
