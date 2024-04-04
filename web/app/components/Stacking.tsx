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
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M14 8.66675H15.3333C16.2174 8.66675 17.0652 9.01794 17.6904 9.64306C18.3155 10.2682 18.6667 11.116 18.6667 12.0001C18.6667 12.8841 18.3155 13.732 17.6904 14.3571C17.0652 14.9822 16.2174 15.3334 15.3333 15.3334H14"
                        stroke="#7BF178"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M9.33337 12H14.6667"
                        stroke="#7BF178"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                      <g clip-path="url(#clip0_452_1675)">
                        <path
                          d="M7.99992 14.6668C11.6818 14.6668 14.6666 11.6821 14.6666 8.00016C14.6666 4.31826 11.6818 1.3335 7.99992 1.3335C4.31802 1.3335 1.33325 4.31826 1.33325 8.00016C1.33325 11.6821 4.31802 14.6668 7.99992 14.6668Z"
                          stroke="#797C80"
                          stroke-width="1.42857"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M6.05994 5.99989C6.21667 5.55434 6.52604 5.17863 6.93324 4.93931C7.34044 4.7 7.8192 4.61252 8.28472 4.69237C8.75024 4.77222 9.17248 5.01424 9.47665 5.37558C9.78083 5.73691 9.94731 6.19424 9.9466 6.66656C9.9466 7.99989 7.9466 8.66656 7.9466 8.66656"
                          stroke="#797C80"
                          stroke-width="1.42857"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M8 11.3335H8.00648"
                          stroke="#797C80"
                          stroke-width="1.42857"
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
              <div className="mt-4 w-full p-6 bg-sd-gray-light rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between font-medium">
                  <div>
                    <p className="text-sd-gray text-sm">Stacked</p>
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
                      <span className="inline-flex items-center text-base sm:text-2xl font-semibold">
                        {stStxBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-1.5 inline"
                          width="20"
                          height="20"
                          fill="none"
                        >
                          <circle cx="10" cy="10" r="10" fill="#C8ECE0" />
                          <path
                            fill="#308D8A"
                            d="m11.9841 11.8973 2.1674 3.3839h-1.6192l-2.54433-3.9758-2.54436 3.9758H5.83304l2.16742-3.3751H4.89069V10.625H15.0938v1.2723h-3.1097ZM15.1407 8.07765V9.375H4.89072V8.07765h3.06381l-2.15156-3.3589h1.62659l2.58184 4.052 2.5905-4.052h1.6266l-2.1516 3.3589h3.0638Z"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:text-end">
                    <p className="text-sd-gray text-sm">Available</p>
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
                      <span className="inline-flex items-center text-base sm:text-2xl font-semibold">
                        {stxBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <svg
                          className="ml-1.5 inline"
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="none"
                        >
                          <circle cx="10" cy="10" r="10" fill="#514CF6" />
                          <path
                            fill="#fff"
                            fill-rule="evenodd"
                            d="M11.7816 8.2754c-.0383-.06519-.0328-.14666.0109-.21185l1.8282-2.68875c.0492-.07605.0547-.16839.0109-.24444-.0438-.08148-.1259-.12493-.2134-.12493h-.7116c-.0766 0-.1532.03802-.2025.10864l-2.1347 3.15046c-.0547.08148-.1423.12494-.2408.12494h-.26817c-.09852 0-.1861-.04889-.24083-.12494L7.4959 5.10864C7.45211 5.03802 7.37001 5 7.29338 5h-.71155c-.08758 0-.17515.04888-.21347.13036-.04378.08148-.03284.17382.01095.24444l1.82814 2.69419c.04379.05975.04926.14122.01095.20641-.03832.07061-.104.10863-.18063.10863H5.24083c-.13683 0-.24083.10864-.24083.239v.58664c0 .1358.10947.239.24083.239h9.51837c.1368 0 .2408-.10863.2408-.239v-.58664c0-.12493-.0931-.2227-.2135-.239h-2.8243c-.0766 0-.1478-.03802-.1806-.10863Zm-2.15653 3.4601L7.49043 14.886c-.04379.0705-.12589.1086-.20252.1086h-.71156c-.08757 0-.16967-.0489-.21346-.1249-.04379-.0761-.03831-.1739.01095-.2445l1.82266-2.6887c.04379-.0652.04926-.1413.01095-.2119-.03832-.0652-.104-.1086-.18063-.1086H5.24083C5.10947 11.616 5 11.5128 5 11.377v-.5867c0-.1303.104-.239.24083-.239h9.51837c.1313 0 .2408.1032.2408.239v.5867c0 .1304-.104.239-.2408.239h-2.7915c-.0821 0-.1478.038-.1806.1086-.0383.0706-.0329.1467.0109.2064l1.8282 2.6942c.0437.0706.0547.163.0109.2445-.0438.0814-.1259.1303-.2135.1303h-.7115c-.0821 0-.1533-.038-.1971-.1032l-2.1346-3.1505c-.0547-.0814-.1423-.1249-.2408-.1249h-.26822c-.09852 0-.1861.0489-.24083.1249l-.00548-.0108Z"
                            clip-rule="evenodd"
                          />
                        </svg>
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

              <div className="mt-4 w-full p-6 bg-sd-gray-light rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                      <g clip-path="url(#clip0_512_1702)">
                        <path
                          d="M6.99996 12.8332C10.2216 12.8332 12.8333 10.2215 12.8333 6.99984C12.8333 3.77818 10.2216 1.1665 6.99996 1.1665C3.7783 1.1665 1.16663 3.77818 1.16663 6.99984C1.16663 10.2215 3.7783 12.8332 6.99996 12.8332Z"
                          stroke="#797C80"
                          stroke-width="1.16667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                          stroke="#797C80"
                          stroke-width="1.16667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M7 9.9165H7.00648"
                          stroke="#797C80"
                          stroke-width="1.16667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
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
                      1{' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-1.5 mr-2 inline"
                        width="20"
                        height="20"
                        fill="none"
                      >
                        <circle cx="10" cy="10" r="10" fill="#C8ECE0" />
                        <path
                          fill="#308D8A"
                          d="m11.9841 11.8973 2.1674 3.3839h-1.6192l-2.54433-3.9758-2.54436 3.9758H5.83304l2.16742-3.3751H4.89069V10.625H15.0938v1.2723h-3.1097ZM15.1407 8.07765V9.375H4.89072V8.07765h3.06381l-2.15156-3.3589h1.62659l2.58184 4.052 2.5905-4.052h1.6266l-2.1516 3.3589h3.0638Z"
                        />
                      </svg>
                      = {stxRatio}{' '}
                      <svg
                        className="ml-1.5 inline"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="none"
                      >
                        <circle cx="10" cy="10" r="10" fill="#514CF6" />
                        <path
                          fill="#fff"
                          fill-rule="evenodd"
                          d="M11.7816 8.2754c-.0383-.06519-.0328-.14666.0109-.21185l1.8282-2.68875c.0492-.07605.0547-.16839.0109-.24444-.0438-.08148-.1259-.12493-.2134-.12493h-.7116c-.0766 0-.1532.03802-.2025.10864l-2.1347 3.15046c-.0547.08148-.1423.12494-.2408.12494h-.26817c-.09852 0-.1861-.04889-.24083-.12494L7.4959 5.10864C7.45211 5.03802 7.37001 5 7.29338 5h-.71155c-.08758 0-.17515.04888-.21347.13036-.04378.08148-.03284.17382.01095.24444l1.82814 2.69419c.04379.05975.04926.14122.01095.20641-.03832.07061-.104.10863-.18063.10863H5.24083c-.13683 0-.24083.10864-.24083.239v.58664c0 .1358.10947.239.24083.239h9.51837c.1368 0 .2408-.10863.2408-.239v-.58664c0-.12493-.0931-.2227-.2135-.239h-2.8243c-.0766 0-.1478-.03802-.1806-.10863Zm-2.15653 3.4601L7.49043 14.886c-.04379.0705-.12589.1086-.20252.1086h-.71156c-.08757 0-.16967-.0489-.21346-.1249-.04379-.0761-.03831-.1739.01095-.2445l1.82266-2.6887c.04379-.0652.04926-.1413.01095-.2119-.03832-.0652-.104-.1086-.18063-.1086H5.24083C5.10947 11.616 5 11.5128 5 11.377v-.5867c0-.1303.104-.239.24083-.239h9.51837c.1313 0 .2408.1032.2408.239v.5867c0 .1304-.104.239-.2408.239h-2.7915c-.0821 0-.1478.038-.1806.1086-.0383.0706-.0329.1467.0109.2064l1.8282 2.6942c.0437.0706.0547.163.0109.2445-.0438.0814-.1259.1303-.2135.1303h-.7115c-.0821 0-.1533-.038-.1971-.1032l-2.1346-3.1505c-.0547-.0814-.1423-.1249-.2408-.1249h-.26822c-.09852 0-.1861.0489-.24083.1249l-.00548-.0108Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-1"
                      >
                        <g clip-path="url(#clip0_512_1702)">
                          <path
                            d="M6.99996 12.8332C10.2216 12.8332 12.8333 10.2215 12.8333 6.99984C12.8333 3.77818 10.2216 1.1665 6.99996 1.1665C3.7783 1.1665 1.16663 3.77818 1.16663 6.99984C1.16663 10.2215 3.7783 12.8332 6.99996 12.8332Z"
                            stroke="#797C80"
                            stroke-width="1.16667"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M5.30249 5.24984C5.43963 4.85998 5.71033 4.53124 6.06663 4.32184C6.42293 4.11244 6.84185 4.03589 7.24918 4.10576C7.65651 4.17563 8.02597 4.3874 8.29212 4.70357C8.55827 5.01974 8.70394 5.4199 8.70332 5.83318C8.70332 6.99984 6.95332 7.58318 6.95332 7.58318"
                            stroke="#797C80"
                            stroke-width="1.16667"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M7 9.9165H7.00648"
                            stroke="#797C80"
                            stroke-width="1.16667"
                            stroke-linecap="round"
                            stroke-linejoin="round"
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

              <div className="mt-4 w-full p-6 bg-sd-gray-light rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sd-gray">Yearly rewards</p>
                    <p className="text-sm text-sd-gray">STX per year</p>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-2xl font-semibold">
                      ~
                      {yieldPerYear.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <svg
                      className="inline"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                    >
                      <circle cx="10" cy="10" r="10" fill="#514CF6" />
                      <path
                        fill="#fff"
                        fill-rule="evenodd"
                        d="M11.7816 8.2754c-.0383-.06519-.0328-.14666.0109-.21185l1.8282-2.68875c.0492-.07605.0547-.16839.0109-.24444-.0438-.08148-.1259-.12493-.2134-.12493h-.7116c-.0766 0-.1532.03802-.2025.10864l-2.1347 3.15046c-.0547.08148-.1423.12494-.2408.12494h-.26817c-.09852 0-.1861-.04889-.24083-.12494L7.4959 5.10864C7.45211 5.03802 7.37001 5 7.29338 5h-.71155c-.08758 0-.17515.04888-.21347.13036-.04378.08148-.03284.17382.01095.24444l1.82814 2.69419c.04379.05975.04926.14122.01095.20641-.03832.07061-.104.10863-.18063.10863H5.24083c-.13683 0-.24083.10864-.24083.239v.58664c0 .1358.10947.239.24083.239h9.51837c.1368 0 .2408-.10863.2408-.239v-.58664c0-.12493-.0931-.2227-.2135-.239h-2.8243c-.0766 0-.1478-.03802-.1806-.10863Zm-2.15653 3.4601L7.49043 14.886c-.04379.0705-.12589.1086-.20252.1086h-.71156c-.08757 0-.16967-.0489-.21346-.1249-.04379-.0761-.03831-.1739.01095-.2445l1.82266-2.6887c.04379-.0652.04926-.1413.01095-.2119-.03832-.0652-.104-.1086-.18063-.1086H5.24083C5.10947 11.616 5 11.5128 5 11.377v-.5867c0-.1303.104-.239.24083-.239h9.51837c.1313 0 .2408.1032.2408.239v.5867c0 .1304-.104.239-.2408.239h-2.7915c-.0821 0-.1478.038-.1806.1086-.0383.0706-.0329.1467.0109.2064l1.8282 2.6942c.0437.0706.0547.163.0109.2445-.0438.0814-.1259.1303-.2135.1303h-.7115c-.0821 0-.1533-.038-.1971-.1032l-2.1346-3.1505c-.0547-.0814-.1423-.1249-.2408-.1249h-.26822c-.09852 0-.1861.0489-.24083.1249l-.00548-.0108Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row items-center gap-2 mt-6">
                <Link
                  href={`${referral ? `/stack?referral=${referral}` : '/stack'}`}
                  className="flex items-center justify-center rounded-lg py-4 px-6 font-semibold border-2 border-dark-green-600 focus:outline-none text-lg xl:text-xl bg-dark-green-600 text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full"
                >
                  <span>{stStxBalance > 0 ? 'Stack more STX' : 'Start stacking STX'}</span>
                </Link>

                <Link
                  href="/unstack"
                  className={`flex items-center justify-center rounded-lg py-4 px-6 font-semibold focus:outline-none text-lg xl:text-xl text-dark-green-600 border-2 border-dark-green-600 bg-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full`}
                  style={{
                    pointerEvents: stStxBalance > 0 ? 'auto' : 'none',
                  }}
                >
                  Unstack stSTX
                </Link>
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
