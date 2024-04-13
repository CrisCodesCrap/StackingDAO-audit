// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext/AppContext';
import { ApyModal } from './ApyModal';
import { RatioModal } from './RatioModal';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useConnect } from '@stacks/connect-react';
import { useSTXAddress } from '../common/use-stx-address';
import { ChooseWalletModal } from './ChooseWalletModal';
import { resolveProvider } from '../common/utils';
import { Stats } from './Stats';
import { PoX } from './PoX';
import { Tooltip } from 'react-tooltip';
import StxLogo from './Logos/Stx';
import StStxLogo from './Logos/StStx';
import { currency } from '../common/utils';

export function Stacking() {
  const stxAddress = useSTXAddress();
  const { doOpenAuth } = useConnect();

  const { stStxBalance, stxBalance, stxRatio, stackingApy, setStxAddress, setOkxProvider } =
    useAppContext();
  const searchParams = useSearchParams();
  const referral = searchParams.get('referral');

  const [isLoading, setIsLoading] = useState(true);
  const [yieldPerYear, setYieldPerYear] = useState(0);
  const [showApyInfo, setShowApyInfo] = useState(false);
  const [showRatioInfo, setShowRatioInfo] = useState(false);
  const [stStxWidth, setStStxWidth] = useState(0);
  const [showChooseWalletModal, setShowChooseWalletModal] = useState(false);

  const showModalOrConnectWallet = async () => {
    const provider = resolveProvider();
    if (provider?.isOkxWallet) {
      const resp = await provider.connect();
      setStxAddress(resp['address']);
      setOkxProvider(provider);
    } else if (provider) {
      doOpenAuth(true, undefined, provider);
    } else {
      setShowChooseWalletModal(true);
    }
  };

  const onProviderChosen = async (providerString: string) => {
    localStorage.setItem('stacking-sign-provider', providerString);
    setShowChooseWalletModal(false);

    const provider = resolveProvider();
    if (provider?.isOkxWallet) {
      const resp = await provider.connect();
      setStxAddress(resp['address']);
      setOkxProvider(provider);
    } else {
      await doOpenAuth(true, undefined, provider);
    }
  };

  useEffect(() => {
    const fetchBalances = async () => {
      if (stStxBalance > 0) {
        setYieldPerYear((stackingApy / 100.0) * stStxBalance);
        setStStxWidth((100.0 * stStxBalance) / (stStxBalance + stxBalance));
      }
      setIsLoading(false);
    };

    if (stxAddress) {
      fetchBalances();
    }
  }, [stxAddress, stxBalance, stStxBalance]);

  useEffect(() => {
    if (referral) localStorage.setItem('stacking-referral', referral);
  }, [referral]);

  return (
    <>
      <ChooseWalletModal
        open={showChooseWalletModal}
        closeModal={() => setShowChooseWalletModal(false)}
        onProviderChosen={onProviderChosen}
      />

      {showApyInfo && <ApyModal open={showApyInfo} setOpen={setShowApyInfo} />}
      {showRatioInfo && <RatioModal open={showRatioInfo} setOpen={setShowRatioInfo} />}

      {stxAddress ? (
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">
          <div className="p-8 md:p-12 bg-white rounded-xl flex items-center justify-center shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
            <div className="flex flex-col w-full min-h-full md:max-w-xl">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-headings">Stacking STX</h1>
                {referral ? (
                  <div className="relative flex items-center" id="referralAddress">
                    <Tooltip anchorSelect="#referralAddress" place="top">
                      You are using {referral} as referral address
                    </Tooltip>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline mr-2"
                    >
                      <circle cx="12" cy="12" r="12" fill="#1D3730" />
                      <path
                        d="M10 15.3334H8.66671C7.78265 15.3334 6.93481 14.9822 6.30968 14.3571C5.68456 13.732 5.33337 12.8841 5.33337 12.0001C5.33337 11.116 5.68456 10.2682 6.30968 9.64306C6.93481 9.01794 7.78265 8.66675 8.66671 8.66675H10"
                        stroke="#7BF178"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 8.66675H15.3333C16.2174 8.66675 17.0652 9.01794 17.6904 9.64306C18.3155 10.2682 18.6667 11.116 18.6667 12.0001C18.6667 12.8841 18.3155 13.732 17.6904 14.3571C17.0652 14.9822 16.2174 15.3334 15.3333 15.3334H14"
                        stroke="#7BF178"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.33337 12H14.6667"
                        stroke="#7BF178"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-semibold">Referral link</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline ml-1.5"
                    >
                      <g clipPath="url(#clip0_452_1675)">
                        <path
                          d="M7.99992 14.6668C11.6818 14.6668 14.6666 11.6821 14.6666 8.00016C14.6666 4.31826 11.6818 1.3335 7.99992 1.3335C4.31802 1.3335 1.33325 4.31826 1.33325 8.00016C1.33325 11.6821 4.31802 14.6668 7.99992 14.6668Z"
                          stroke="#797C80"
                          strokeWidth="1.42857"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.05994 5.99989C6.21667 5.55434 6.52604 5.17863 6.93324 4.93931C7.34044 4.7 7.8192 4.61252 8.28472 4.69237C8.75024 4.77222 9.17248 5.01424 9.47665 5.37558C9.78083 5.73691 9.94731 6.19424 9.9466 6.66656C9.9466 7.99989 7.9466 8.66656 7.9466 8.66656"
                          stroke="#797C80"
                          strokeWidth="1.42857"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 11.3335H8.00648"
                          stroke="#797C80"
                          strokeWidth="1.42857"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_452_1675">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                ) : null}
              </div>
              <div className="w-full p-6 mt-4 rounded-lg bg-sd-gray-light">
                <div className="flex flex-col font-medium sm:flex-row sm:justify-between">
                  <div>
                    <p className="text-sm text-sd-gray">Stacked</p>
                    {isLoading ? (
                      <div className="flex w-full h-3 my-3 rounded-md bg-sd-gray-light animate-pulse">
                        <div className="flex items-center w-[75%]">
                          <div className="w-1/3 h-full bg-gray-400/70 rounded-l-md" />
                          <div className="w-1/3 h-full bg-gray-400/80" />
                          <div className="w-1/3 h-full bg-gray-400/90" />
                        </div>
                        <div className="w-[25%] bg-gray-400 rounded-r-md" />
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-base font-semibold sm:text-2xl">
                        {currency.short.format(stStxBalance)}
                        <StStxLogo className="w-5 h-5 ml-1.5 inline" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:text-end">
                    <p className="text-sm text-sd-gray">Available</p>
                    {isLoading ? (
                      <div className="flex w-full h-3 my-3 rounded-md bg-sd-gray-light animate-pulse">
                        <div className="flex items-center w-[75%]">
                          <div className="w-1/3 h-full bg-gray-400/70 rounded-l-md" />
                          <div className="w-1/3 h-full bg-gray-400/80" />
                          <div className="w-1/3 h-full bg-gray-400/90" />
                        </div>
                        <div className="w-[25%] bg-gray-400 rounded-r-md" />
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-base font-semibold sm:text-2xl">
                        {currency.short.format(stxBalance)}
                        <StxLogo className="inline w-5 h-5 ml-1.5" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex w-full h-5 gap-1 mt-8">
                  <div
                    className="h-full rounded bg-fluor-green-500"
                    style={{ width: `${stStxWidth}%` }}
                  ></div>
                  <div
                    className="h-full rounded bg-sd-gray-dark"
                    style={{ width: `${100 - stStxWidth}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-full p-6 mt-4 rounded-lg bg-sd-gray-light">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sd-gray">Projected yield</p>
                  <Tooltip anchorSelect="#apyInfo" place="top">
                    Learn more
                  </Tooltip>
                  <button
                    id="apyInfo"
                    type="button"
                    onClick={() => {
                      setShowApyInfo(true);
                    }}
                    className="flex items-center gap-1 text-base font-semibold w-fit"
                  >
                    APY {stackingApy}%
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_512_1702)">
                        <path
                          d="M6.99996 12.8332C10.2216 12.8332 12.8333 10.2215 12.8333 6.99984C12.8333 3.77818 10.2216 1.1665 6.99996 1.1665C3.7783 1.1665 1.16663 3.77818 1.16663 6.99984C1.16663 10.2215 3.7783 12.8332 6.99996 12.8332Z"
                          stroke="#797C80"
                          strokeWidth="1.16667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                          stroke="#797C80"
                          strokeWidth="1.16667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 9.9165H7.00648"
                          stroke="#797C80"
                          strokeWidth="1.16667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_512_1702">
                          <rect width="14" height="14" fill="#797C80" />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sd-gray">Conversion rate</p>
                  <Tooltip anchorSelect="#ratioInfo" place="top">
                    Learn more
                  </Tooltip>
                  <div className="flex items-center font-semibold" id="ratioInfo">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRatioInfo(true);
                      }}
                      className="flex items-center text-base w-fit"
                    >
                      1 <StStxLogo className="mx-1.5 inline w-5 h-5" />= {stxRatio}{' '}
                      <StxLogo className="inline w-5 h-5 ml-1.5" />
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-1"
                      >
                        <g clipPath="url(#clip0_512_1702)">
                          <path
                            d="M6.99996 12.8332C10.2216 12.8332 12.8333 10.2215 12.8333 6.99984C12.8333 3.77818 10.2216 1.1665 6.99996 1.1665C3.7783 1.1665 1.16663 3.77818 1.16663 6.99984C1.16663 10.2215 3.7783 12.8332 6.99996 12.8332Z"
                            stroke="#797C80"
                            strokeWidth="1.16667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                            stroke="#797C80"
                            strokeWidth="1.16667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7 9.9165H7.00648"
                            stroke="#797C80"
                            strokeWidth="1.16667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_512_1702">
                            <rect width="14" height="14" fill="#797C80" />
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full p-6 mt-4 rounded-lg bg-sd-gray-light">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sd-gray">Yearly rewards</p>
                    <p className="text-sm text-sd-gray">STX per year</p>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-2xl font-semibold">
                      ~{currency.short.format(yieldPerYear)}
                    </span>
                    <StxLogo className="inline w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 mt-6 xl:flex-row">
                <Link
                  href={`${referral ? `/stack?referral=${referral}` : '/stack'}`}
                  className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white border-2 rounded-lg border-dark-green-600 focus:outline-none xl:text-xl bg-dark-green-600 active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50"
                >
                  <span>{stStxBalance > 0 ? 'Stack more STX' : 'Start stacking STX'}</span>
                </Link>

                {stStxBalance > 0 ? (
                  <Link
                    href="/unstack"
                    className={`flex items-center justify-center rounded-lg py-4 px-6 font-semibold focus:outline-none text-lg xl:text-xl text-dark-green-600 border-2 border-dark-green-600 bg-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full`}
                    style={{
                      pointerEvents: stStxBalance > 0 ? 'auto' : 'none',
                    }}
                  >
                    Unstack stSTX
                  </Link>
                ) : null}
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
      ) : (
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">
          <div className="p-8 md:p-12 bg-white rounded-xl flex items-center justify-center shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
            <div className="flex flex-col text-center max-w-[90%]">
              <svg
                className="mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                width="81"
                height="72"
                fill="none"
              >
                <path
                  fill="#7BF178"
                  d="m68.9677 22.0613-2.772-2.1945c-3.2236-2.5522-7.1919-3.9369-11.2774-3.9369h-37.304V0h37.3006c7.5745 0 14.9319 2.56968 20.9068 7.29886l2.7685 2.19106-9.626 12.57138h.0035ZM48.1022 71.9965H23.6753c-7.5746 0-14.93195-2.5697-20.9068-7.2989L0 62.5066l9.62596-12.5714 2.76854 2.1945c3.2236 2.5522 7.1953 3.9404 11.2808 3.9404h24.4269V72v-.0035ZM53.4288 28.035H29.5156c-6.5644 0-11.9049-5.4303-11.9049-12.1051H1.94438c0 15.4601 12.37032 28.035 27.57122 28.035h23.9132c6.5644 0 11.9049 5.4303 11.9049 12.1052H81C81 40.61 68.6297 28.035 53.4288 28.035Z"
                />
              </svg>

              <h1 className="mt-8 text-2xl text-center font-headings">
                All you ever need in one place for STX Stacking
              </h1>
              <p className="mt-3 mb-6 text-base font-normal text-center text-sd-gray">
                Start stacking STX, review your existing STX locked in PoX, and unstack at any time,
                for the best price.
              </p>
              <button
                type="button"
                className="mt-12 flex gap-2 items-center justify-center rounded-lg px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-dark-green-600 text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full mb-2"
                onClick={() => showModalOrConnectWallet()}
              >
                Connect wallet
              </button>
            </div>
          </div>

          <div className="p-8 md:p-12 bg-dark-green-600 rounded-xl shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
            <div className="flex flex-col">
              <Stats />
              <PoX />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
