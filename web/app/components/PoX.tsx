// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext/AppContext';
import { Tooltip } from 'react-tooltip';
import { ExternalLinkIcon } from '@heroicons/react/outline';

export function PoX() {
  const { stackingCycle, stackedStx, cycleDaysLeft, nextRewardCycleBlocks } = useAppContext();
  const [endDate, setEndDate] = useState();

  useEffect(() => {
    const newDate = new Date(Date.now() + cycleDaysLeft * 24 * 60 * 60 * 1000);

    setEndDate(newDate);
  }, [cycleDaysLeft]);

  return (
    <div className="mt-12">
      <div>
        <h2 className="text-2xl text-white font-headings">Stacks Proof-of-Transfer stats</h2>
        <a
          className="bg-white/[.08] shrink-0 rounded text-white px-1.5 gap-1.5 py-1 text-xs inline-flex items-center gap-1 border border-transparent hover:border-white/20"
          href="https://docs.stacks.co/stacks-101/proof-of-transfer"
        >
          More about PoX
          <ExternalLinkIcon className="w-3 h-3 text-white opacity-40" />
        </a>
      </div>
      <dl className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2">
        <div className="flex flex-wrap p-4 rounded-lg bg-white/10">
          <dt className="text-sm font-medium leading-6 text-white/70">Stacking Cycle #</dt>
          <dd className="flex-none w-full text-xl font-medium leading-6 text-white">
            {stackingCycle}
          </dd>
        </div>

        <div className="flex flex-wrap p-4 rounded-lg bg-white/10">
          <dt className="text-sm font-medium leading-6 text-white/70">Total STX Stacked</dt>
          <dd className="flex-none w-full text-xl font-medium leading-6 text-white">
            {(stackedStx / 1000000).toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}
          </dd>
        </div>

        <div className="flex flex-wrap p-4 rounded-lg bg-white/10">
          <dt className="text-sm font-medium leading-6 text-white/70">Cycle Days Left</dt>
          <dd className="flex items-center w-full text-xl font-medium leading-6 text-white">
            {cycleDaysLeft}{' '}
            <Tooltip anchorSelect="#endsOn" place="top">
              Ends on{' '}
              {endDate?.toLocaleDateString('en-us', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Tooltip>
            <div
              className="relative flex flex-col items-center justify-center mx-1 cursor-pointer"
              id="endsOn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none">
                <g
                  stroke="#ffffff"
                  stroke-opacity={35}
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
            </div>
          </dd>
        </div>

        <div className="flex flex-wrap p-4 rounded-lg bg-white/10">
          <dt className="text-sm font-medium leading-6 text-white/70">Bitcoin Blocks Left</dt>
          <dd className="flex-none w-full text-xl font-medium leading-6 text-white">
            {nextRewardCycleBlocks}
          </dd>
        </div>
      </dl>
    </div>
  );
}
