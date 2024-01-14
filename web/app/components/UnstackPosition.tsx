// @ts-nocheck

'use client'

import { useEffect, useState } from 'react'
import { useConnect } from '@stacks/connect-react';
import {
  uintCV,
  contractPrincipalCV,
  FungibleConditionCode,
  createAssetInfo,
  makeContractSTXPostCondition,
  makeStandardNonFungiblePostCondition,
  makeContractFungiblePostCondition,
  NonFungibleConditionCode
} from '@stacks/transactions'
import { useAppContext } from './AppContext'
import { useSTXAddress } from '../common/use-stx-address';
import { stacksNetwork, resolveProvider, formatSeconds } from '../common/utils';

export function UnstackPosition({ id, cycleId, stStxAmount, stxAmount, currentCycleId }) {
  const stxAddress = useSTXAddress();
  const { doContractCall } = useConnect();
  const { nextRewardCycleBlocks, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [withdrawalBlocksLeft, setWithdrawalBlocksLeft] = useState(2100);

  useEffect(() => {
    const withdrawalEnabled = Number(cycleId) <= currentCycleId && nextRewardCycleBlocks <= 2000;
    setCanWithdraw(withdrawalEnabled);

    const cycleDiff = Number(currentCycleId) - Number(cycleId);
    if (Math.abs(cycleDiff) > 1) {
      // can withdraw in 2+ cycles
      setWithdrawalBlocksLeft(2100 + nextRewardCycleBlocks);
    } else if (Math.abs(cycleDiff) === 1) {
      // can withdraw in next cycle
      setWithdrawalBlocksLeft(nextRewardCycleBlocks);
    } else {
      // can withdraw in current cycle, should at least be 100 blocks in
      setWithdrawalBlocksLeft(nextRewardCycleBlocks - 2000);
    }
  }, []);

  const withdraw = async () => {
    if (!canWithdraw) return;

    const postConditions = [

      // STX transfer from reserve
      makeContractSTXPostCondition(
        process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        'reserve-v1',
        FungibleConditionCode.Equal,
        stxAmount * 1000000
      ),

      // stSTX transfer from core
      makeContractFungiblePostCondition(
        process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        'stacking-dao-core-v1',
        FungibleConditionCode.Equal,
        stStxAmount * 1000000,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'ststx-token',
          'ststx'
        )
      ),

      // NFT not owned by user
      makeStandardNonFungiblePostCondition(
        stxAddress!,
        NonFungibleConditionCode.Sends,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'ststx-withdraw-nft',
          'ststx-withdraw'
        ),
        uintCV(id)
      )
    ];
    await doContractCall({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'stacking-dao-core-v1',
      functionName: 'withdraw',
      functionArgs: [
        contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1'),
        uintCV(id)
      ],
      postConditions: postConditions,
      network: stacksNetwork,
      onFinish: async data => {
        setCurrentTxId(data.txId);
        setCurrentTxStatus('pending');
      }
    }, resolveProvider() || window.StacksProvider);
  };

  return (
    <div
      role="button"
      tabIndex="0"
      className="bg-white rounded-xl w-full"
      style={{'WebkitTapHighlightColor': 'transparent'}}
      onClick={() => withdraw() }
    >
      <div className="pl-4 pr-3">
        <div className="flex gap-3 items-center text-left py-2">
          <div className="w-10 h-10 relative flex-shrink-0">
            <img alt="stSTX asset icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/sdao-logo.jpg" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
          </div>
          <div className="flex-grow flex justify-between">
            <div>
              <span className="text-lg font-semibold line-clamp-1 text-ellipsis">NFT #{id} unlocks {stStxAmount.toLocaleString()} stSTX in cycle #{cycleId}</span>
              <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">StackingDAO Stacked STX</span>
            </div>
            <div className="text-right">
              {canWithdraw ? (
                <button type="button" disabled={!canWithdraw} className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full">
                  <span>Withdraw {stxAmount.toLocaleString()} STX</span>
                </button>
              ) : (
                <span>Withdrawal available in {withdrawalBlocksLeft} Bitcoin blocks</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
