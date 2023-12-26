// @ts-nocheck

'use client'

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
import { stacksNetwork, resolveProvider } from '../common/utils';

export function UnstackPosition({ id, cycleId, stStxAmount, stxAmount, currentCycleId }) {
  const stxAddress = useSTXAddress();
  const { doContractCall } = useConnect();
  const { bitcoinBlocksLeft, setCurrentTxId, setCurrentTxStatus } = useAppContext();

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
