// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext/AppContext';

export function PoX() {
  const { stackingCycle, stackedStx, cycleDaysLeft, nextRewardCycleBlocks } = useAppContext();
  const [endDate, setEndDate] = useState();

  useEffect(() => {
    const newDate = new Date(Date.now() + cycleDaysLeft * 24 * 60 * 60 * 1000);

    setEndDate(newDate);
  }, [cycleDaysLeft]);

  return (
    <div className="w-full mt-8">
      <span className="text-tertiary-text font-medium">Stacks Proof-of-Transfer stats</span>
      <div className="bg-white border-2 rounded-xl w-full p-4">
        <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4 mt-0 text-center">
          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">Stacking Cycle #</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {stackingCycle}
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">Total STX Stacked</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {(stackedStx / 1000000).toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">Cycle Days Left</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {cycleDaysLeft}{' '}
              <span className="text-xs">
                (ends on{' '}
                {endDate?.toLocaleDateString('en-us', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                )
              </span>
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">Bitcoin Blocks Left</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {nextRewardCycleBlocks}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
