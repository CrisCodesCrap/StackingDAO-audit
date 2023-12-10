// @ts-nocheck

'use client'

import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';

export function PoX() {
  const { stackingCycle, stackedStx, cycleDaysLeft, bitcoinBlocksLeft } = useAppContext();
  const [endDate, setEndDate] = useState();

  useEffect(() => {
    const newDate = new Date(Date.now() + cycleDaysLeft*24*60*60*1000);

    setEndDate(newDate);
  }, [cycleDaysLeft]);

  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4 mt-8 text-center">
      <div
        className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">Stacking Cycle #</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {stackingCycle}
        </dd>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">STX Stacked</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {(stackedStx / 1000000).toLocaleString()}
        </dd>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">Cycle Days Left</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {cycleDaysLeft} <span className="text-xs">(ends on {endDate?.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})})</span>
        </dd>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">Bitcoin Blocks Left</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {bitcoinBlocksLeft}
        </dd>
      </div>
    </dl>
  );
}
