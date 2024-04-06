'use client';

import { useSTXAddress } from '@/app/common/use-stx-address';
import { UnstackPosition } from '../UnstackPosition';
import { usePositionsData } from './Positions.hook';

import Image from 'next/image';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';
import StStxLogo from '../Logos/StStx';
import StxLogo from '../Logos/Stx';
import { currency } from '@/app/common/utils';

export function Positions() {
  const stxAddress = useSTXAddress();

  const positions = usePositionsData(stxAddress);

  if (!stxAddress) return <></>;

  return (
    <div className="flex flex-col w-full mt-16 mb-10">
      <h3 className="text-lg font-medium md:mb-4 md:text-2xl font-headings">Active Positions</h3>

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* stSTX */}
          {positions.stStxBalance > 0 && (
            <Link
              id="stStxBalance"
              href="/defi"
              key={`stStxBalance`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl hover:bg-dark-green-500/80 group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Tooltip anchorSelect="#stStxBalance" place="top">
                Earn additional yield in Stacks DeFi
              </Tooltip>
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.stStxBalance)}
                    </div>
                    <StStxLogo className="inline w-5 h-5 ml-2" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    {positions.stackingApy}% APY
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <StStxLogo className="w-10 h-10" />
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis group-hover:text-white">
                      stSTX
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1 group-hover:text-white">
                      StackingDAO Stacked STX
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Withdraw NFT */}
          {positions.unstackNfts.map(nft => (
            <UnstackPosition
              key={`unstack-${nft.id}`}
              id={nft.id}
              cycleId={nft['cycle-id']}
              stStxAmount={nft['ststx-amount']}
              stxAmount={nft['stx-amount']}
              currentCycleId={positions.currentCycleId}
            />
          ))}

          {/* Genesis NFT */}
          {positions.genesisNfts.map(nft => (
            <div
              key={`genesis-${nft.id}`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">1</div>
                    <svg
                      className="inline ml-2"
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10.5" cy="10" r="10" fill="#1E3731" />
                      <path
                        d="M14.0144 8.2578L13.6722 7.98347C13.2742 7.66443 12.7843 7.49133 12.2799 7.49133H7.67451V5.5H12.2795C13.2146 5.5 14.1229 5.82123 14.8605 6.4124L15.2023 6.6863L14.0144 8.2578Z"
                        fill="#7BF179"
                      />
                      <path
                        d="M11.4385 14.5H8.42285C7.48772 14.5 6.57942 14.1788 5.84179 13.5876L5.5 13.3137L6.68838 11.7422L7.03016 12.0165C7.42814 12.3356 7.91847 12.5091 8.42285 12.5091H11.4385V14.5Z"
                        fill="#7BF179"
                      />
                      <path
                        d="M12.0962 9.00455H9.14396C8.33355 9.00455 7.67451 8.32573 7.67451 7.49133L5.74014 7.49133C5.74014 9.42394 7.26733 10.9959 9.14396 10.9959H12.0962C12.9066 10.9959 13.5659 11.6747 13.5659 12.5091H15.5C15.5 10.5765 13.9728 9.00455 12.0962 9.00455Z"
                        fill="#7BF179"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    Special Points Multiplier
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="20" cy="20" r="20" fill="#1E3731" />
                    <path
                      d="M27.0287 16.5156L26.3443 15.9669C25.5484 15.3289 24.5686 14.9827 23.5598 14.9827H14.349V11H23.5589C25.4292 11 27.2458 11.6425 28.7211 12.8248L29.4046 13.3726L27.0287 16.5156Z"
                      fill="#7BF179"
                    />
                    <path
                      d="M21.877 29H15.8457C13.9754 29 12.1588 28.3575 10.6836 27.1752L10 26.6274L12.3768 23.4844L13.0603 24.0331C13.8563 24.6711 14.8369 25.0182 15.8457 25.0182H21.877V29Z"
                      fill="#7BF179"
                    />
                    <path
                      d="M23.1924 18.0091H17.2879C15.6671 18.0091 14.349 16.6515 14.349 14.9827L10.4803 14.9827C10.4803 18.8479 13.5347 21.9918 17.2879 21.9918H23.1924C24.8132 21.9918 26.1318 23.3494 26.1318 25.0182H30C30 21.153 26.9456 18.0091 23.1924 18.0091Z"
                      fill="#7BF179"
                    />
                  </svg>
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      Genesis {nft.name} NFT
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Stacking DAO Genesis NFT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Zest lending stSTX */}
          {positions.zestProvision > 0 && (
            <div
              key={`zestProvision`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.zestProvision)}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="10.5"
                        cy="10"
                        r="9.375"
                        fill="#1E3731"
                        stroke="#FF8A17"
                        stroke-width="1.25"
                      />
                      <path
                        d="M12.4841 11.8973L14.6515 15.2812H13.0323L10.488 11.3054L7.94361 15.2812H6.33304L8.50046 11.9061H5.39069V10.625H15.5938V11.8973H12.4841Z"
                        fill="#7BF179"
                      />
                      <path
                        d="M15.6407 8.07765V9.36612V9.375H5.39072V8.07765H8.45453L6.30297 4.71875H7.92956L10.5114 8.77075L13.1019 4.71875H14.7285L12.5769 8.07765H15.6407Z"
                        fill="#7BF179"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield + yield on Zest
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
                      fill="#EDEDED"
                    />
                    <path
                      d="M34.7275 18.6128C33.8182 17.4264 32.4399 16.7466 30.9475 16.7466H9.05385C7.56147 16.7466 6.1831 17.4264 5.27381 18.6128C4.37463 19.7848 4.07875 21.2728 4.45978 22.6916C5.23484 25.5753 6.80517 28.1877 8.99756 30.2459C12.0834 33.1397 16.0409 34.5874 19.9999 34.5874C23.9575 34.5874 27.918 33.1397 31.0023 30.2459C33.1962 28.1877 34.765 25.5753 35.5401 22.6916C35.9226 21.2728 35.6253 19.7862 34.7275 18.6128ZM9.3887 25.2564C8.70313 24.1854 8.18065 23.0163 7.84869 21.7809C7.71734 21.2916 7.92374 20.9235 8.05941 20.7474C8.299 20.4342 8.66271 20.2553 9.0553 20.2553H14.7867C15.149 20.2553 15.3294 20.6926 15.0739 20.9481L10.6401 25.3819C10.2763 25.7442 9.66437 25.6879 9.3887 25.2564ZM18.2463 29.9875C18.2463 30.4999 17.7744 30.8925 17.2735 30.7828C15.8634 30.4725 14.498 29.9183 13.2438 29.1187C12.8108 28.843 12.7531 28.2296 13.1168 27.8673L17.5535 23.4306C17.809 23.1751 18.2463 23.3555 18.2463 23.7178V29.9875ZM19.9999 22.0522C18.8612 22.0522 17.9374 21.1285 17.9374 19.9897C17.9374 18.8509 18.8612 17.9272 19.9999 17.9272C21.1387 17.9272 22.0624 18.8509 22.0624 19.9897C22.0624 21.1285 21.1402 22.0522 19.9999 22.0522ZM26.7575 29.1187C25.5033 29.9168 24.1379 30.4711 22.7278 30.7828C22.227 30.8925 21.755 30.4999 21.755 29.9875V23.7178C21.755 23.3555 22.1923 23.1751 22.4478 23.4306L26.8846 27.8673C27.2483 28.2296 27.1905 28.843 26.7575 29.1187ZM32.1526 21.7823C31.8207 23.0178 31.2982 24.1869 30.6126 25.2578C30.3355 25.6894 29.725 25.7456 29.3627 25.3834L24.9289 20.9495C24.6734 20.694 24.8538 20.2567 25.2161 20.2567H30.9475C31.3401 20.2567 31.7023 20.4357 31.9434 20.7489C32.0776 20.925 32.284 21.293 32.1526 21.7823Z"
                      fill="#FF6702"
                    />
                  </svg>
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      Zest Protocol
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Lending stSTX on Zest
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BitFlow LP V1.1 */}
          {positions.bitflowBalance.lpStaked > 0 && (
            <div
              key={`bitflowLpStaked1`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.bitflowBalance.lpStaked)}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="10" fill="#254841" />
                      <path
                        d="M11.9047 4H8.09526C5.83379 4 4 5.8336 4 8.09493V11.7832H8.24133C7.93134 11.3713 7.74746 10.8595 7.74746 10.3058C7.74746 8.94813 8.85189 7.84379 10.2097 7.84379C11.5673 7.84379 12.6718 8.94813 12.6718 10.3058C12.6718 10.5779 12.4512 10.7986 12.179 10.7986C11.9068 10.7986 11.6861 10.5779 11.6861 10.3058C11.6861 9.49144 11.023 8.82837 10.2086 8.82837C9.39419 8.82837 8.73107 9.49144 8.73107 10.3058C8.73107 11.1201 9.39419 11.7832 10.2086 11.7832H14.3943C14.6664 11.7832 14.8871 12.0038 14.8871 12.276C14.8871 12.5481 14.6664 12.7688 14.3943 12.7688H4.0925C4.48864 14.6151 6.13014 16 8.09526 16H11.9047C14.1662 16 16 14.1664 16 11.9051V8.09493C16 5.8336 14.1662 4 11.9047 4ZM14.1588 10.5433C13.8867 10.5433 13.666 10.3226 13.666 10.0504C13.666 8.14955 12.1191 6.60386 10.2191 6.60386C8.31909 6.60386 6.77224 8.15061 6.77224 10.0504C6.77224 10.3226 6.55154 10.5433 6.27938 10.5433C6.00717 10.5433 5.78651 10.3226 5.78651 10.0504C5.78651 7.60629 7.77477 5.61928 10.2181 5.61928C12.6624 5.61928 14.6496 7.60734 14.6496 10.0504C14.6496 10.3226 14.4289 10.5433 14.1568 10.5433H14.1588Z"
                        fill="#DDD5B1"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield + yield on Bitflow
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
                      fill="#254841"
                    />
                    <path
                      d="M23.492 9H16.508C12.362 9 9 12.3616 9 16.5074V23.2691H16.7758C16.2075 22.514 15.8703 21.5758 15.8703 20.5606C15.8703 18.0716 17.8951 16.047 20.3844 16.047C22.8735 16.047 24.8983 18.0716 24.8983 20.5606C24.8983 21.0595 24.4938 21.4641 23.9948 21.4641C23.4958 21.4641 23.0913 21.0595 23.0913 20.5606C23.0913 19.0676 21.8755 17.852 20.3824 17.852C18.8894 17.852 17.6736 19.0676 17.6736 20.5606C17.6736 22.0536 18.8894 23.2691 20.3824 23.2691H28.0561C28.5551 23.2691 28.9597 23.6736 28.9597 24.1726C28.9597 24.6716 28.5551 25.0762 28.0561 25.0762H9.16958C9.89584 28.4609 12.9053 31 16.508 31H23.492C27.638 31 31 27.6383 31 23.4926V16.5074C31 12.3616 27.638 9 23.492 9ZM27.6245 20.996C27.1255 20.996 26.7209 20.5914 26.7209 20.0925C26.7209 16.6075 23.885 13.7737 20.4016 13.7737C16.9183 13.7737 14.0824 16.6094 14.0824 20.0925C14.0824 20.5914 13.6778 20.996 13.1789 20.996C12.6798 20.996 12.2753 20.5914 12.2753 20.0925C12.2753 15.6115 15.9204 11.9687 20.3998 11.9687C24.8811 11.9687 28.5242 15.6135 28.5242 20.0925C28.5242 20.5914 28.1197 20.996 27.6207 20.996H27.6245Z"
                      fill="#DDD5B1"
                    />
                  </svg>
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      STX/stSTX v1.1
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Staked liquidity on Bitflow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {positions.bitflowBalance.lpWallet > 0 && (
            <div
              key={`bitflowLpWallet1`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.bitflowBalance.lpWallet)}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="10" fill="#254841" />
                      <path
                        d="M11.9047 4H8.09526C5.83379 4 4 5.8336 4 8.09493V11.7832H8.24133C7.93134 11.3713 7.74746 10.8595 7.74746 10.3058C7.74746 8.94813 8.85189 7.84379 10.2097 7.84379C11.5673 7.84379 12.6718 8.94813 12.6718 10.3058C12.6718 10.5779 12.4512 10.7986 12.179 10.7986C11.9068 10.7986 11.6861 10.5779 11.6861 10.3058C11.6861 9.49144 11.023 8.82837 10.2086 8.82837C9.39419 8.82837 8.73107 9.49144 8.73107 10.3058C8.73107 11.1201 9.39419 11.7832 10.2086 11.7832H14.3943C14.6664 11.7832 14.8871 12.0038 14.8871 12.276C14.8871 12.5481 14.6664 12.7688 14.3943 12.7688H4.0925C4.48864 14.6151 6.13014 16 8.09526 16H11.9047C14.1662 16 16 14.1664 16 11.9051V8.09493C16 5.8336 14.1662 4 11.9047 4ZM14.1588 10.5433C13.8867 10.5433 13.666 10.3226 13.666 10.0504C13.666 8.14955 12.1191 6.60386 10.2191 6.60386C8.31909 6.60386 6.77224 8.15061 6.77224 10.0504C6.77224 10.3226 6.55154 10.5433 6.27938 10.5433C6.00717 10.5433 5.78651 10.3226 5.78651 10.0504C5.78651 7.60629 7.77477 5.61928 10.2181 5.61928C12.6624 5.61928 14.6496 7.60734 14.6496 10.0504C14.6496 10.3226 14.4289 10.5433 14.1568 10.5433H14.1588Z"
                        fill="#DDD5B1"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield + yield on Bitflow
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
                      fill="#254841"
                    />
                    <path
                      d="M23.492 9H16.508C12.362 9 9 12.3616 9 16.5074V23.2691H16.7758C16.2075 22.514 15.8703 21.5758 15.8703 20.5606C15.8703 18.0716 17.8951 16.047 20.3844 16.047C22.8735 16.047 24.8983 18.0716 24.8983 20.5606C24.8983 21.0595 24.4938 21.4641 23.9948 21.4641C23.4958 21.4641 23.0913 21.0595 23.0913 20.5606C23.0913 19.0676 21.8755 17.852 20.3824 17.852C18.8894 17.852 17.6736 19.0676 17.6736 20.5606C17.6736 22.0536 18.8894 23.2691 20.3824 23.2691H28.0561C28.5551 23.2691 28.9597 23.6736 28.9597 24.1726C28.9597 24.6716 28.5551 25.0762 28.0561 25.0762H9.16958C9.89584 28.4609 12.9053 31 16.508 31H23.492C27.638 31 31 27.6383 31 23.4926V16.5074C31 12.3616 27.638 9 23.492 9ZM27.6245 20.996C27.1255 20.996 26.7209 20.5914 26.7209 20.0925C26.7209 16.6075 23.885 13.7737 20.4016 13.7737C16.9183 13.7737 14.0824 16.6094 14.0824 20.0925C14.0824 20.5914 13.6778 20.996 13.1789 20.996C12.6798 20.996 12.2753 20.5914 12.2753 20.0925C12.2753 15.6115 15.9204 11.9687 20.3998 11.9687C24.8811 11.9687 28.5242 15.6135 28.5242 20.0925C28.5242 20.5914 28.1197 20.996 27.6207 20.996H27.6245Z"
                      fill="#DDD5B1"
                    />
                  </svg>
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      STX/stSTX v1.1
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Liquidity on Bitflow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BitFlow LP V1.2 */}
          {positions.bitflowBalance.lpStaked2 > 0 && (
            <div
              key={`bitflowLpStaked2`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.bitflowBalance.lpStaked2)}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="10" fill="#254841" />
                      <path
                        d="M11.9047 4H8.09526C5.83379 4 4 5.8336 4 8.09493V11.7832H8.24133C7.93134 11.3713 7.74746 10.8595 7.74746 10.3058C7.74746 8.94813 8.85189 7.84379 10.2097 7.84379C11.5673 7.84379 12.6718 8.94813 12.6718 10.3058C12.6718 10.5779 12.4512 10.7986 12.179 10.7986C11.9068 10.7986 11.6861 10.5779 11.6861 10.3058C11.6861 9.49144 11.023 8.82837 10.2086 8.82837C9.39419 8.82837 8.73107 9.49144 8.73107 10.3058C8.73107 11.1201 9.39419 11.7832 10.2086 11.7832H14.3943C14.6664 11.7832 14.8871 12.0038 14.8871 12.276C14.8871 12.5481 14.6664 12.7688 14.3943 12.7688H4.0925C4.48864 14.6151 6.13014 16 8.09526 16H11.9047C14.1662 16 16 14.1664 16 11.9051V8.09493C16 5.8336 14.1662 4 11.9047 4ZM14.1588 10.5433C13.8867 10.5433 13.666 10.3226 13.666 10.0504C13.666 8.14955 12.1191 6.60386 10.2191 6.60386C8.31909 6.60386 6.77224 8.15061 6.77224 10.0504C6.77224 10.3226 6.55154 10.5433 6.27938 10.5433C6.00717 10.5433 5.78651 10.3226 5.78651 10.0504C5.78651 7.60629 7.77477 5.61928 10.2181 5.61928C12.6624 5.61928 14.6496 7.60734 14.6496 10.0504C14.6496 10.3226 14.4289 10.5433 14.1568 10.5433H14.1588Z"
                        fill="#DDD5B1"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield + yield on Bitflow
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
                      fill="#254841"
                    />
                    <path
                      d="M23.492 9H16.508C12.362 9 9 12.3616 9 16.5074V23.2691H16.7758C16.2075 22.514 15.8703 21.5758 15.8703 20.5606C15.8703 18.0716 17.8951 16.047 20.3844 16.047C22.8735 16.047 24.8983 18.0716 24.8983 20.5606C24.8983 21.0595 24.4938 21.4641 23.9948 21.4641C23.4958 21.4641 23.0913 21.0595 23.0913 20.5606C23.0913 19.0676 21.8755 17.852 20.3824 17.852C18.8894 17.852 17.6736 19.0676 17.6736 20.5606C17.6736 22.0536 18.8894 23.2691 20.3824 23.2691H28.0561C28.5551 23.2691 28.9597 23.6736 28.9597 24.1726C28.9597 24.6716 28.5551 25.0762 28.0561 25.0762H9.16958C9.89584 28.4609 12.9053 31 16.508 31H23.492C27.638 31 31 27.6383 31 23.4926V16.5074C31 12.3616 27.638 9 23.492 9ZM27.6245 20.996C27.1255 20.996 26.7209 20.5914 26.7209 20.0925C26.7209 16.6075 23.885 13.7737 20.4016 13.7737C16.9183 13.7737 14.0824 16.6094 14.0824 20.0925C14.0824 20.5914 13.6778 20.996 13.1789 20.996C12.6798 20.996 12.2753 20.5914 12.2753 20.0925C12.2753 15.6115 15.9204 11.9687 20.3998 11.9687C24.8811 11.9687 28.5242 15.6135 28.5242 20.0925C28.5242 20.5914 28.1197 20.996 27.6207 20.996H27.6245Z"
                      fill="#DDD5B1"
                    />
                  </svg>
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      STX/stSTX v1.2
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Staked liquidity on Bitflow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {positions.bitflowBalance.lpWallet2 > 0 && (
            <div
              key={`bitflowLpWallet2`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.bitflowBalance.lpWallet2)}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="10" fill="#254841" />
                      <path
                        d="M11.9047 4H8.09526C5.83379 4 4 5.8336 4 8.09493V11.7832H8.24133C7.93134 11.3713 7.74746 10.8595 7.74746 10.3058C7.74746 8.94813 8.85189 7.84379 10.2097 7.84379C11.5673 7.84379 12.6718 8.94813 12.6718 10.3058C12.6718 10.5779 12.4512 10.7986 12.179 10.7986C11.9068 10.7986 11.6861 10.5779 11.6861 10.3058C11.6861 9.49144 11.023 8.82837 10.2086 8.82837C9.39419 8.82837 8.73107 9.49144 8.73107 10.3058C8.73107 11.1201 9.39419 11.7832 10.2086 11.7832H14.3943C14.6664 11.7832 14.8871 12.0038 14.8871 12.276C14.8871 12.5481 14.6664 12.7688 14.3943 12.7688H4.0925C4.48864 14.6151 6.13014 16 8.09526 16H11.9047C14.1662 16 16 14.1664 16 11.9051V8.09493C16 5.8336 14.1662 4 11.9047 4ZM14.1588 10.5433C13.8867 10.5433 13.666 10.3226 13.666 10.0504C13.666 8.14955 12.1191 6.60386 10.2191 6.60386C8.31909 6.60386 6.77224 8.15061 6.77224 10.0504C6.77224 10.3226 6.55154 10.5433 6.27938 10.5433C6.00717 10.5433 5.78651 10.3226 5.78651 10.0504C5.78651 7.60629 7.77477 5.61928 10.2181 5.61928C12.6624 5.61928 14.6496 7.60734 14.6496 10.0504C14.6496 10.3226 14.4289 10.5433 14.1568 10.5433H14.1588Z"
                        fill="#DDD5B1"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
                      fill="#254841"
                    />
                    <path
                      d="M23.492 9H16.508C12.362 9 9 12.3616 9 16.5074V23.2691H16.7758C16.2075 22.514 15.8703 21.5758 15.8703 20.5606C15.8703 18.0716 17.8951 16.047 20.3844 16.047C22.8735 16.047 24.8983 18.0716 24.8983 20.5606C24.8983 21.0595 24.4938 21.4641 23.9948 21.4641C23.4958 21.4641 23.0913 21.0595 23.0913 20.5606C23.0913 19.0676 21.8755 17.852 20.3824 17.852C18.8894 17.852 17.6736 19.0676 17.6736 20.5606C17.6736 22.0536 18.8894 23.2691 20.3824 23.2691H28.0561C28.5551 23.2691 28.9597 23.6736 28.9597 24.1726C28.9597 24.6716 28.5551 25.0762 28.0561 25.0762H9.16958C9.89584 28.4609 12.9053 31 16.508 31H23.492C27.638 31 31 27.6383 31 23.4926V16.5074C31 12.3616 27.638 9 23.492 9ZM27.6245 20.996C27.1255 20.996 26.7209 20.5914 26.7209 20.0925C26.7209 16.6075 23.885 13.7737 20.4016 13.7737C16.9183 13.7737 14.0824 16.6094 14.0824 20.0925C14.0824 20.5914 13.6778 20.996 13.1789 20.996C12.6798 20.996 12.2753 20.5914 12.2753 20.0925C12.2753 15.6115 15.9204 11.9687 20.3998 11.9687C24.8811 11.9687 28.5242 15.6135 28.5242 20.0925C28.5242 20.5914 28.1197 20.996 27.6207 20.996H27.6245Z"
                      fill="#DDD5B1"
                    />
                  </svg>
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      STX/stSTX v1.2
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Liquidity on Bitflow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Velar LP */}
          {positions.velarBalance.lpStaked > 0 && (
            <div
              key="velarLPStaked"
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.velarBalance.lpStaked)}
                    </div>
                    <div className="relative flex-shrink-0 inline w-5 h-5 ml-2">
                      <Image
                        alt="stSTX/STX LP Velar icon"
                        loading="lazy"
                        decoding="async"
                        data-nimg="fill"
                        fill
                        className="rounded-full"
                        src="/velar-logo.png"
                        style={{
                          position: 'absolute',
                          height: '100%',
                          width: '100%',
                          inset: '0px',
                          color: 'transparent',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield + yield on Velar
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="relative flex-shrink-0 w-10 h-10">
                  <Image
                    alt="stSTX/STX LP Velar icon"
                    loading="lazy"
                    decoding="async"
                    data-nimg="fill"
                    fill
                    className="rounded-full"
                    src="/velar-logo.png"
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      inset: '0px',
                      color: 'transparent',
                    }}
                  />
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      stSTX/aeUSDC
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Staked liquidity on Velar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {positions.velarBalance.lpWallet > 0 && (
            <div
              key="velarLpWallet"
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.velarBalance.lpWallet)}
                    </div>
                    <div className="relative flex-shrink-0 inline w-5 h-5 ml-2">
                      <Image
                        alt="stSTX/STX LP Velar icon"
                        loading="lazy"
                        decoding="async"
                        data-nimg="fill"
                        fill
                        className="rounded-full"
                        src="/velar-logo.png"
                        style={{
                          position: 'absolute',
                          height: '100%',
                          width: '100%',
                          inset: '0px',
                          color: 'transparent',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="relative flex-shrink-0 w-10 h-10">
                  <Image
                    alt="stSTX/STX LP Velar icon"
                    loading="lazy"
                    decoding="async"
                    data-nimg="fill"
                    fill
                    className="rounded-full"
                    src="/velar-logo.png"
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      inset: '0px',
                      color: 'transparent',
                    }}
                  />
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      stSTX/aeUSDC
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Liquidity on Velar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Arkadiko Vault  */}
          {positions.arkadikoBalance.vault > 0 && (
            <div
              key="arkadikoBalance.vault"
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.arkadikoBalance.vault)}
                    </div>
                    <StStxLogo className="inline w-5 h-5 ml-2" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    stSTX yield
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
                      fill="#6366F1"
                    />
                    <path
                      d="M15.6117 10.6079C15.6987 10.4259 15.8358 10.272 16.0081 10.1646C16.1807 10.0566 16.3806 9.99955 16.5845 10H21.1768C21.3612 9.9989 21.5428 10.0452 21.704 10.1343C21.8652 10.2235 22.0006 10.3526 22.0969 10.509L31.8484 26.421C32.0485 26.7446 32.0485 27.147 31.8604 27.471C31.7653 27.6323 31.6294 27.7659 31.4661 27.8585C31.3023 27.9513 31.1171 27.9999 30.9286 27.9996H26.1285C25.845 28.001 25.5723 27.8919 25.3687 27.6956C23.5791 26.0144 21.3325 24.893 18.9079 24.4707C16.1881 24.0406 12.9836 24.6284 9.82757 27.6956C9.64772 27.8683 9.41369 27.9743 9.16466 27.9959C8.91563 28.0175 8.6667 27.9533 8.45954 27.8141C8.25352 27.6765 8.10378 27.4701 8.03739 27.2323C7.97137 26.995 7.99328 26.742 8.09911 26.5195L15.6078 10.6079H15.6117ZM18.4518 12.088L26.7448 25.9077H29.0407L20.5682 12.0923H18.4518V12.088ZM22.8083 23.4923L16.6998 13.3038L11.8196 23.6381C14.0949 22.43 16.7067 22 19.252 22.4147C20.5322 22.6116 21.7322 23.0068 22.8083 23.4923Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                      stSTX vault collateral
                    </span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">
                      Arkadiko Finance
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STX */}
          {positions.stxBalance > 0 && (
            <div
              key={`stxBalance`}
              tabIndex={0}
              className="w-full p-6 bg-white rounded-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-center p-6 text-center rounded-lg bg-sd-gray-light">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {currency.short.format(positions.stxBalance)}
                    </div>
                    <StxLogo className="inline w-5 h-5 ml-2" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-sd-gray">
                    Not earning yield
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <StxLogo className="w-10 h-10" />
                </div>
                <div className="flex justify-between flex-grow">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">STX</span>
                    <span className="flex flex-wrap gap-1 -mt-1 text-sm line-clamp-1">Stacks</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
