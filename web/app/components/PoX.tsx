'use client'

import { useEffect, useState } from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function PoX() {
  const [stackedStx, setStackedStx] = useState(0);
  const [stackingCycle, setStackingCycle] = useState(0);
  const [cycleDaysLeft, setCycleDaysLeft] = useState(0);
  const [bitcoinBlocksLeft, setBitcoinBlocksLeft] = useState(0);

  const fetchStackingCycle = async () => {
    const metaInfoUrl = `https://api.mainnet.hiro.so/v2/pox`; 
    fetch(metaInfoUrl)
      .then(res => res.json())
      .then(response => {
        setStackingCycle(response['current_cycle']['id']);
        setStackedStx(response['current_cycle']['stacked_ustx']);
        const blocksUntilNextCycle = response['next_cycle']['blocks_until_prepare_phase'];
        setBitcoinBlocksLeft(blocksUntilNextCycle);

        const blocksSinceStart = 2100 - blocksUntilNextCycle;  // 2100 blocks in a cycle
        const currentTimestamp = Date.now(); // in milliseconds
        const startTimestamp = currentTimestamp - blocksSinceStart*10*60000; // 10 minutes per block time 60,000 milliseconds per minute
        const endTimestamp = currentTimestamp + blocksUntilNextCycle*10*60000;
        // const daysPassed = Math.round(
        //   (currentTimestamp - startTimestamp) / (1000 * 60 * 60 * 24)
        // );
        const daysLeft = Math.max(
          0,
          Math.round((endTimestamp - currentTimestamp) / (1000 * 60 * 60 * 24))
        );
        setCycleDaysLeft(daysLeft);
      });
  };

  useEffect(() => {
    fetchStackingCycle();
  }, []);

  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4 mt-8">
      <div
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">Stacking Cycle #</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {stackingCycle}
        </dd>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">STX Stacked</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {(stackedStx / 1000000).toLocaleString()}
        </dd>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">Cycle Days Left</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {cycleDaysLeft} <span className="text-xs">(ends on Aug 10 2023)</span>
        </dd>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
      >
        <dt className="text-sm font-medium leading-6 text-gray-500">Bitcoin Blocks Left</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {bitcoinBlocksLeft}
        </dd>
      </div>
    </dl>
  );
}
