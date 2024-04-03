'use client';

import { useSTXAddress } from '@/app/common/use-stx-address';
import { UnstackPosition } from '../UnstackPosition';
import { usePositionsData } from './Positions.hook';

import Image from 'next/image';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';

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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.stStxBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="10" fill="#C8ECE0"></circle>
                      <path
                        d="M11.9841 11.8973L14.1515 15.2812H12.5323L9.98797 11.3054L7.44361 15.2812H5.83304L8.00046 11.9061H4.89069V10.625H15.0938V11.8973H11.9841Z"
                        fill="#308D8A"
                      ></path>
                      <path
                        d="M15.1407 8.07765V9.36612V9.375H4.89072V8.07765H7.95453L5.80297 4.71875H7.42956L10.0114 8.77075L12.6019 4.71875H14.2285L12.0769 8.07765H15.1407Z"
                        fill="#308D8A"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-dark-green-600">
                    {positions.stackingApy}% APY
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 mt-4 text-left">
                <div className="shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#C8ECE0"></circle>
                    <path
                      fill="#308D8A"
                      d="m23.9681 23.7946 4.3349 6.7679h-3.2383l-5.0888-7.9518-5.0887 7.9518h-3.2211l4.3348-6.7503H9.78137V21.25H30.1876v2.5446h-6.2195ZM30.2814 16.1553V18.75H9.78137v-2.5947H15.909l-4.3031-6.7178h3.2531l5.1638 8.104 5.181-8.104h3.2531l-4.3031 6.7178h6.1276Z"
                    ></path>
                  </svg>
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.zestProvision.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.bitflowBalance.lpStaked.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.bitflowBalance.lpWallet.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.bitflowBalance.lpStaked2.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.bitflowBalance.lpWallet2.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.velarBalance.lpStaked.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.velarBalance.lpWallet.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.arkadikoBalance.vault.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="10" fill="#C8ECE0"></circle>
                      <path
                        d="M11.9841 11.8973L14.1515 15.2812H12.5323L9.98797 11.3054L7.44361 15.2812H5.83304L8.00046 11.9061H4.89069V10.625H15.0938V11.8973H11.9841Z"
                        fill="#308D8A"
                      ></path>
                      <path
                        d="M15.1407 8.07765V9.36612V9.375H4.89072V8.07765H7.95453L5.80297 4.71875H7.42956L10.0114 8.77075L12.6019 4.71875H14.2285L12.0769 8.07765H15.1407Z"
                        fill="#308D8A"
                      ></path>
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
              <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center">
                    <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
                      {positions.stxBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <svg
                      className="inline ml-2"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="10" fill="#514CF6" />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.7816 8.2754C11.7433 8.21021 11.7488 8.12874 11.7925 8.06355L13.6207 5.3748C13.6699 5.29875 13.6754 5.20641 13.6316 5.13036C13.5878 5.04888 13.5057 5.00543 13.4182 5.00543H12.7066C12.63 5.00543 12.5534 5.04345 12.5041 5.11407L10.3694 8.26453C10.3147 8.34601 10.2271 8.38947 10.1286 8.38947H9.86043C9.76191 8.38947 9.67433 8.34058 9.6196 8.26453L7.4959 5.10864C7.45211 5.03802 7.37001 5 7.29338 5H6.58183C6.49425 5 6.40668 5.04888 6.36836 5.13036C6.32458 5.21184 6.33552 5.30418 6.37931 5.3748L8.20745 8.06899C8.25124 8.12874 8.25671 8.21021 8.2184 8.2754C8.18008 8.34601 8.1144 8.38403 8.03777 8.38403H5.24083C5.104 8.38403 5 8.49267 5 8.62303V9.20967C5 9.34547 5.10947 9.44867 5.24083 9.44867H14.7592C14.896 9.44867 15 9.34004 15 9.20967V8.62303C15 8.4981 14.9069 8.40033 14.7865 8.38403C14.7756 8.38403 14.7646 8.38403 14.7537 8.38403H11.9622C11.8856 8.38403 11.8144 8.34601 11.7816 8.2754ZM9.62507 11.7355L7.49043 14.886C7.44664 14.9565 7.36454 14.9946 7.28791 14.9946H6.57635C6.48878 14.9946 6.40668 14.9457 6.36289 14.8697C6.3191 14.7936 6.32458 14.6958 6.37384 14.6252L8.1965 11.9365C8.24029 11.8713 8.24576 11.7952 8.20745 11.7246C8.16913 11.6594 8.10345 11.616 8.02682 11.616H5.24083C5.10947 11.616 5 11.5128 5 11.377V10.7903C5 10.66 5.104 10.5513 5.24083 10.5513H14.7373C14.7373 10.5513 14.7537 10.5513 14.7592 10.5513C14.8905 10.5513 15 10.6545 15 10.7903V11.377C15 11.5074 14.896 11.616 14.7592 11.616H11.9677C11.8856 11.616 11.8199 11.654 11.7871 11.7246C11.7488 11.7952 11.7542 11.8713 11.798 11.931L13.6262 14.6252C13.6699 14.6958 13.6809 14.7882 13.6371 14.8697C13.5933 14.9511 13.5112 15 13.4236 15H12.7121C12.63 15 12.5588 14.962 12.515 14.8968L10.3804 11.7463C10.3257 11.6649 10.2381 11.6214 10.1396 11.6214H9.87138C9.77286 11.6214 9.68528 11.6703 9.63055 11.7463L9.62507 11.7355Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-sd-gray">
                    Not earning yield
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
                    <circle cx="20" cy="20" r="20" fill="#514CF6" />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M23.5632 16.5508C23.4866 16.4204 23.4976 16.2575 23.5851 16.1271L27.2414 10.7496C27.3399 10.5975 27.3509 10.4128 27.2633 10.2607C27.1757 10.0978 27.0115 10.0109 26.8364 10.0109H25.4133C25.26 10.0109 25.1068 10.0869 25.0082 10.2281L20.7389 16.5291C20.6295 16.692 20.4543 16.7789 20.2573 16.7789H19.7209C19.5238 16.7789 19.3487 16.6812 19.2392 16.5291L14.9918 10.2173C14.9042 10.076 14.74 10 14.5868 10H13.1637C12.9885 10 12.8134 10.0978 12.7367 10.2607C12.6492 10.4237 12.671 10.6084 12.7586 10.7496L16.4149 16.138C16.5025 16.2575 16.5134 16.4204 16.4368 16.5508C16.3602 16.692 16.2288 16.7681 16.0755 16.7681H10.4817C10.208 16.7681 10 16.9853 10 17.2461V18.4193C10 18.6909 10.2189 18.8973 10.4817 18.8973H29.5184C29.792 18.8973 30 18.6801 30 18.4193V17.2461C30 16.9962 29.8139 16.8007 29.5731 16.7681C29.5512 16.7681 29.5293 16.7681 29.5074 16.7681H23.9245C23.7712 16.7681 23.6289 16.692 23.5632 16.5508ZM19.2501 23.471L14.9809 29.7719C14.8933 29.9131 14.7291 29.9892 14.5758 29.9892H13.1527C12.9776 29.9892 12.8134 29.8914 12.7258 29.7393C12.6382 29.5871 12.6492 29.3917 12.7477 29.2504L16.393 23.8729C16.4806 23.7426 16.4915 23.5904 16.4149 23.4493C16.3383 23.3188 16.2069 23.232 16.0536 23.232H10.4817C10.2189 23.232 10 23.0255 10 22.7539V21.5807C10 21.32 10.208 21.1027 10.4817 21.1027H29.4746C29.4746 21.1027 29.5074 21.1027 29.5184 21.1027C29.7811 21.1027 30 21.3091 30 21.5807V22.7539C30 23.0147 29.792 23.232 29.5184 23.232H23.9354C23.7712 23.232 23.6399 23.308 23.5742 23.4493C23.4976 23.5904 23.5085 23.7426 23.5961 23.862L27.2524 29.2504C27.3399 29.3917 27.3618 29.5763 27.2742 29.7393C27.1867 29.9023 27.0225 30 26.8473 30H25.4242C25.26 30 25.1177 29.924 25.0301 29.7936L20.7608 23.4927C20.6514 23.3297 20.4762 23.2428 20.2792 23.2428H19.7428C19.5457 23.2428 19.3706 23.3406 19.2611 23.4927L19.2501 23.471Z"
                      fill="white"
                    />
                  </svg>
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
