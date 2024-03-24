// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext/AppContext';
import { callReadOnlyFunction } from '@stacks/transactions';
import { stacksNetwork } from '../common/utils';

export function Stats() {
  const { stxPrice } = useAppContext();

  const [totalStx, setTotalStx] = useState<number>(0);
  const [stackingStx, setStackingStx] = useState<number>(0);
  const [idleStx, setIdleStx] = useState<number>(0);

  useEffect(() => {
    const fetchTotal = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'reserve-v1',
        functionName: 'get-total-stx',
        functionArgs: [],
        senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        network: stacksNetwork,
      });

      setTotalStx(Number(result?.value?.value) / 1000000);
    };

    const fetchStxStacking = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'reserve-v1',
        functionName: 'get-stx-stacking',
        functionArgs: [],
        senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        network: stacksNetwork,
      });

      setStackingStx(Number(result?.value?.value) / 1000000);
    };

    const fetchStxIdle = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'reserve-v1',
        functionName: 'get-stx-balance',
        functionArgs: [],
        senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        network: stacksNetwork,
      });

      setIdleStx(Number(result?.value?.value) / 1000000);
    };

    fetchTotal();
    fetchStxStacking();
    fetchStxIdle();
  }, []);

  return (
    <div className="w-full mt-8">
      <span className="text-tertiary-text font-medium">Stacking DAO stats</span>
      <div className="bg-white border-2 rounded-xl w-full p-4">
        <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4 mt-0 text-center">
          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">TVL</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {Math.ceil(totalStx).toLocaleString('en-US')} <span className="text-xs">STX</span>
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">TVL</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              ${Math.ceil(totalStx * stxPrice).toLocaleString('en-US')}
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">Stacked</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {Math.ceil(stackingStx).toLocaleString('en-US')} <span className="text-xs">STX</span>
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0 bg-white px-4 py-3 sm:py-6 sm:px-6 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-gray-500">Idle</dt>
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {Math.ceil(idleStx).toLocaleString('en-US')} <span className="text-xs">STX</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
