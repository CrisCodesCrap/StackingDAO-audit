// @ts-nocheck

'use client'

import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity'
import {
  FungibleConditionCode,
  createAssetInfo,
  makeContractSTXPostCondition,
  makeStandardNonFungiblePostCondition,
  makeContractFungiblePostCondition,
  NonFungibleConditionCode
} from 'micro-stacks/transactions'
import { useAccount, useOpenContractCall } from '@micro-stacks/react'
import { useAppContext } from './AppContext'

export function UnstackPosition({ id, cycleId, stStxAmount, stxAmount, currentCycleId }) {
  const { openContractCall } = useOpenContractCall();
  const { bitcoinBlocksLeft, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const { stxAddress } = useAccount();

  const withdraw = async () => {
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
        'core-v1',
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
        NonFungibleConditionCode.DoesNotOwn,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'ststx-withdraw-nft',
          'ststx-withdraw'
        ),
        uintCV(id)
      )
    ];
    await openContractCall({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'stacking-dao-core-v1',
      functionName: 'withdraw',
      functionArgs: [
        contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1'),
        uintCV(id)
      ],
      postConditions: postConditions,
      onFinish: async data => {
        setCurrentTxId(data.txId);
        setCurrentTxStatus('pending');
      }
    });
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
            <img alt="stSTX asset icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/stdao-logo.jpg" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
          </div>
          <div className="flex-grow flex justify-between">
            <div>
              <span className="text-lg font-semibold line-clamp-1 text-ellipsis">NFT #{id} unlocks {stStxAmount.toLocaleString()} stSTX in cycle #{cycleId}</span>
              <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">StackingDAO Stacked STX</span>
            </div>
            <div className="text-right">
              <button type="button" disabled={Number(cycleId) > currentCycleId} className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full">
                {Number(cycleId) <= currentCycleId ? (
                  <span>Withdraw {stxAmount.toLocaleString()} STX</span>
                ) : (
                  <span>Withdraw in {bitcoinBlocksLeft} blocks</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
