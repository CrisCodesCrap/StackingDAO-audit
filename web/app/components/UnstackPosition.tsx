// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useConnect } from '@stacks/connect-react';
import {
  uintCV,
  contractPrincipalCV,
  FungibleConditionCode,
  createAssetInfo,
  makeContractSTXPostCondition,
  makeStandardNonFungiblePostCondition,
  makeContractFungiblePostCondition,
  NonFungibleConditionCode,
} from '@stacks/transactions';
import { useAppContext } from './AppContext/AppContext';
import { useSTXAddress } from '../common/use-stx-address';
import { stacksNetwork, formatSeconds } from '../common/utils';
import { makeContractCall } from '../common/contract-call';

import { Tooltip } from 'react-tooltip';
import clsx from 'clsx';

export function UnstackPosition({ id, cycleId, stStxAmount, stxAmount, currentCycleId }) {
  const stxAddress = useSTXAddress();
  const { nextRewardCycleBlocks, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [withdrawalBlocksLeft, setWithdrawalBlocksLeft] = useState(2100);

  useEffect(() => {
    const withdrawalEnabled = Number(cycleId) <= currentCycleId && nextRewardCycleBlocks <= 1998;
    setCanWithdraw(withdrawalEnabled);

    const cycleDiff = Number(currentCycleId) - Number(cycleId);
    if (Math.abs(cycleDiff) > 1) {
      // can withdraw in 2+ cycles
      setWithdrawalBlocksLeft(2100 + nextRewardCycleBlocks + 102);
    } else if (Math.abs(cycleDiff) === 1) {
      // can withdraw in next cycle
      setWithdrawalBlocksLeft(nextRewardCycleBlocks + 102);
    } else {
      // can withdraw in current cycle, should at least be 100 blocks in
      setWithdrawalBlocksLeft(nextRewardCycleBlocks - 1998);
    }
  }, []);

  const withdraw = async () => {
    if (!canWithdraw) return;

    const postConditions = [
      // STX transfer from reserve
      makeContractSTXPostCondition(
        process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        'reserve-v1',
        FungibleConditionCode.GreaterEqual,
        parseInt(stxAmount * 1000000, 10)
      ),

      // stSTX transfer from core
      makeContractFungiblePostCondition(
        process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        'stacking-dao-core-v1',
        FungibleConditionCode.GreaterEqual,
        parseInt(stStxAmount * 1000000, 10),
        createAssetInfo(process.env.NEXT_PUBLIC_STSTX_ADDRESS, 'ststx-token', 'ststx')
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
      ),
    ];

    await makeContractCall(
      {
        stxAddress: stxAddress,
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'stacking-dao-core-v1',
        functionName: 'withdraw',
        functionArgs: [
          contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1'),
          uintCV(id),
        ],
        postConditions: postConditions,
        network: stacksNetwork,
      },
      async (error?, txId?) => {
        setCurrentTxId(txId);
        setCurrentTxStatus('pending');
      }
    );
  };

  return (
    <div
      role="button"
      tabIndex="0"
      className="bg-white hover:bg-neutral-100 rounded-xl w-full py-2 px-4"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      onClick={() => withdraw()}
    >
      <div className="flex gap-3 items-center text-left py-2">
        <div className="w-10 h-10 relative flex-shrink-0">
          <img
            alt="stSTX asset icon"
            loading="lazy"
            decoding="async"
            data-nimg="fill"
            className="rounded-full"
            src="/sdao-logo.jpg"
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              inset: '0px',
              color: 'transparent',
            }}
          />
        </div>
        <div className="flex-grow flex justify-between">
          <div>
            <span className="text-lg font-semibold line-clamp-1 text-ellipsis">
              NFT #{id} unlocks {stStxAmount.toLocaleString('en-US')} stSTX in cycle #{cycleId}
            </span>
            <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">
              StackingDAO Stacked STX
            </span>
          </div>
          <div className="text-right">
            {canWithdraw ? (
              <button
                type="button"
                disabled={!canWithdraw}
                className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full"
              >
                <span>Withdraw {stxAmount.toLocaleString('en-US')} STX</span>
              </button>
            ) : (
              <div className="group max-w-max relative mx-1 bg-gray flex flex-col items-center justify-center text-gray-500 hover:text-gray-600">
                <span id="withdrawal-info">
                  Withdrawal available in {withdrawalBlocksLeft} Bitcoin blocks
                </span>
                <Tooltip
                  anchorSelect="#withdrawal-info"
                  place="top"
                  style={{ width: 240, textAlign: 'center' }}
                  clickable
                >
                  Your STX will become available in {withdrawalBlocksLeft} Bitcoin blocks, which is
                  approximately {formatSeconds(withdrawalBlocksLeft * 10)} based on 10 minute
                  blocks. You can follow the Bitcoin blocks on{' '}
                  <a href="https://mempool.space/" className="underline-offset-2 hover:underline">
                    https://mempool.space/
                  </a>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
