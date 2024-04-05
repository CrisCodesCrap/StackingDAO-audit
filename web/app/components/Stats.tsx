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
    <div>
      <h2 className="text-2xl text-white font-headings">
        Stacking DAO stats
      </h2>
      <dl className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2">
        <div
          className="flex flex-wrap p-4 rounded-lg bg-white/10"
        >
          <dt className="text-sm font-medium leading-6 text-white/70">TVL</dt>
          <dd className="flex-none w-full text-xl font-medium leading-6 text-white">
            {Math.ceil(totalStx).toLocaleString('en-US')} <span className="text-xs">STX</span>
          </dd>
        </div>

        <div
          className="flex flex-wrap p-4 rounded-lg bg-white/10"
        >
          <dt className="text-sm font-medium leading-6 text-white/70">TVL</dt>
          <dd className="flex-none w-full text-xl font-medium leading-6 text-white">
            ${Math.ceil(totalStx * stxPrice).toLocaleString('en-US')}
          </dd>
        </div>

        <div
          className="flex flex-wrap p-4 rounded-lg bg-white/10"
        >
          <dt className="text-sm font-medium leading-6 text-white/70">Stacked</dt>
          <dd className="flex-none w-full text-xl font-medium leading-6 text-white">
            {Math.ceil(stackingStx).toLocaleString('en-US')} <span className="text-xs">STX</span>
          </dd>
        </div>

        <div
          className="flex flex-wrap p-4 rounded-lg bg-white/10"
        >
          <dt className="text-sm font-medium leading-6 text-white/70">Idle</dt>
          <dd className="flex-none w-full text-xl font-medium leading-6 text-white">
            {Math.ceil(idleStx).toLocaleString('en-US')} <span className="text-xs">STX</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
