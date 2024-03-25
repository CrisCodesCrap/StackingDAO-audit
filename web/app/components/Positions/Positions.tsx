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
    <div className="w-full flex flex-col gap-1 mt-10 mb-10">
      <span className="text-lg font-medium md:mb-4 md:text-2xl">Active Positions</span>

      {/* stSTX */}
      {positions.stStxBalance > 0 && (
        <Link
          href="/defi"
          key={`stStxBalance`}
          tabIndex={0}
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="stSTX asset icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src="/sdao-logo.jpg"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <Tooltip anchorSelect="#stStxBalance" place="top">
              Earn additional yield in Stacks DeFi
            </Tooltip>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">stSTX</span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  StackingDAO Stacked STX
                </span>
              </div>
              <div id="stStxBalance" className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                  {positions.stStxBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  stSTX
                </div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                  {positions.stackingApy}% APY
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
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="Stacking Genesis NFT icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src={nft.url}
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                  Genesis {nft.name} NFT
                </span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  Stacking DAO Genesis NFT
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">🎇🎇🎇</div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                  Special Points Multiplier
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
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="stSTX Zest icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src="/zest.svg"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                  Zest Protocol
                </span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  Lending stSTX on Zest
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                  {positions.zestProvision.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  stSTX
                </div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                  stSTX yield + yield on Zest
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
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="stSTX/STX LP Bitflow icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src="/bitflow-logo.png"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                  STX/stSTX v1.1
                </span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  Staked liquidity on Bitflow
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                  {positions.bitflowBalance.lpStaked.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  STX-stSTX-LP
                </div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                  stSTX yield + yield on Bitflow
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
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="stSTX/STX LP Bitflow icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src="/bitflow-logo.png"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                  STX/stSTX v1.1
                </span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  Liquidity on Bitflow
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                  {positions.bitflowBalance.lpWallet.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  STX-stSTX-LP
                </div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                  stSTX yield + yield on Bitflow
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
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="stSTX/STX LP Bitflow icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src="/bitflow-logo.png"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                  STX/stSTX v1.2
                </span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  Staked liquidity on Bitflow
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                  {positions.bitflowBalance.lpStaked2.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  STX-stSTX-LP
                </div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                  stSTX yield + yield on Bitflow
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
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="stSTX/STX LP Bitflow icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src="/bitflow-logo.png"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
                  STX/stSTX v1.2
                </span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  Liquidity on Bitflow
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                  {positions.bitflowBalance.lpWallet2.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  STX-stSTX-LP
                </div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                  stSTX yield
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
          className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex gap-3 items-center text-left py-2">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                alt="STX asset icon"
                loading="lazy"
                decoding="async"
                data-nimg="fill"
                fill
                className="rounded-full"
                src="/stacks-stx-logo.png"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px',
                  color: 'transparent',
                }}
              />
            </div>
            <div className="flex-grow flex justify-between">
              <div>
                <span className="text-lg font-semibold line-clamp-1 text-ellipsis">STX</span>
                <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
                  Stacks
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                  {positions.stxBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  STX
                </div>
                <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-tertiary-text">
                  Not earning yield
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
