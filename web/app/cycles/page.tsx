// @ts-nocheck

'use client'

import React, { useEffect, useState } from 'react'
import { Container } from '../components/Container'
import { callReadOnlyFunction, uintCV } from '@stacks/transactions'
import { stacksNetwork } from '../common/utils';

export default function Cycles() {

  const [cyclesInfo, setCyclesInfo] = useState<any[]>([]);
  const [inflow, setInflow] = useState(0.0);

  async function getNextCycle() {
    const url = "https://api.mainnet.hiro.so/v2/pox";
    const response = await fetch(url, { credentials: 'omit' });
    const data = await response.json();

    return {
      cycle: data['current_cycle']['id'] + 1,
      startBlock: data['next_cycle']['prepare_phase_start_block_height']
    }
  }

  async function getBlockHeightFromBurnHeight(burnHeight: number) {
    try {
      const url = `https://api.mainnet.hiro.so/extended/v2/burn-blocks/${burnHeight}/blocks`;
      const response = await fetch(url, { credentials: 'omit' });
      const data = await response.json();
      return data.results[0].height;
    } catch (error) {
      return 0;
    }
  }

  async function fetchCycleInfo(cycle: number) {
    const result = await callReadOnlyFunction({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'stacking-dao-core-v1',
      functionName: 'get-cycle-info',
      functionArgs: [
        uintCV(cycle)
      ],
      senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      network: stacksNetwork
    });

    return {
      number: cycle,
      commission: Number(result.data.commission.value) / 1000000,
      deposited: Number(result.data.deposited.value) / 1000000,
      rewards: Number(result.data.rewards.value) / 1000000,
      withrdaw_init: Number(result.data["withdraw-init"].value) / 1000000,
      withdraw_out: Number(result.data["withdraw-out"].value) / 1000000,
    }
  }

  async function getTotalStacked(blockHeight: number) {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'block-info-v1',
        functionName: 'get-reserve-stacking-at-block',
        functionArgs: [
          uintCV(blockHeight)
        ],
        senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        network: stacksNetwork
      });
      return Number(result.value.value) / 1000000;
    } catch (error) {
      return 0;
    }
  }

  async function getInflow() {
    const result = await callReadOnlyFunction({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'strategy-v0',
      functionName: 'get-outflow-inflow',
      functionArgs: [],
      senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      network: stacksNetwork
    });

    const inflow = Number(result.data.inflow.value) / 1000000;
    const outflow = Number(result.data.outflow.value) / 1000000;
    return inflow - outflow;
  }

  async function fetchAll() {

    const inflow = await getInflow();
    setInflow(inflow)

    //
    // Cycle info
    //
    const nextCycle = await getNextCycle();
    var startBlock = nextCycle.startBlock - 5;
    var allCyclesInfo = []

    for (let cycle = nextCycle.cycle; cycle >= 73; cycle--) {

      // Get cycle info
      const info = await fetchCycleInfo(cycle);

      // Get stacks block height from burn height
      const stacksBlock = await getBlockHeightFromBurnHeight(startBlock);

      // Get amount stacked at given stacks block
      var stacked = 0;
      if (stacksBlock != 0) {
        stacked = await getTotalStacked(stacksBlock)
      }
      info["stacked"] = stacked;

      allCyclesInfo.push(info)
      setCyclesInfo(allCyclesInfo);

      startBlock -= 2100;
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <Container className="mt-12">
      <div className="py-10">
        <div className="w-full text-center hidden md:block font-semibold text-4xl my-8">StackingDAO Cycles</div>

        {inflow > 0 ? (
          <div className="w-full text-center hidden md:block text-md my-8">Net inflow for next cycle: {inflow.toLocaleString('en-US', { maximumFractionDigits: 0 })} STX</div>
        ):(
          <div className="w-full text-center hidden md:block text-md my-8">Net outflow for next cycle: {Math.abs(inflow).toLocaleString('en-US', { maximumFractionDigits: 0 })} STX</div>
        )}

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">
                      Cycle #
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Deposits
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Withdrawal Init
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Withdrawal Out
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stacked
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Commission
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Rewards
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {cyclesInfo.map((cycle) => (
                    <tr key={cycle.number} className="even:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                        {cycle.number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cycle.deposited.toLocaleString('en-US')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cycle.withrdaw_init.toLocaleString('en-US')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cycle.withdraw_out.toLocaleString('en-US')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cycle.stacked.toLocaleString('en-US')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cycle.commission.toLocaleString('en-US')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cycle.rewards.toLocaleString('en-US')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
