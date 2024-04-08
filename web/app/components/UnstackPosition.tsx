// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
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
import { stacksNetwork, formatSeconds, currency } from '../common/utils';
import { makeContractCall } from '../common/contract-call';

import { Tooltip } from 'react-tooltip';

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
      className="w-full p-6 bg-white rounded-xl"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      onClick={() => withdraw()}
      id="withdrawal-info"
    >
      <div className="bg-sd-gray-light p-6 text-center flex items-center justify-center rounded-lg">
        <div className="flex flex-col">
          <div className="flex items-center justify-center">
            <div className="text-xl font-semibold whitespace-nowrap line-clamp-1">
              {currency.default.format(stStxAmount)}
            </div>
            <svg
              className="inline ml-2"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="10" fill="#1E3731" />
              <path
                d="M11.9841 11.8973L14.1515 15.2812H12.5323L9.98797 11.3054L7.44361 15.2812H5.83304L8.00046 11.9061H4.89069V10.625H15.0938V11.8973H11.9841Z"
                fill="#7BF179"
              />
              <path
                d="M15.1407 8.07765V9.36612V9.375H4.89069V8.07765H7.9545L5.80294 4.71875H7.42952L10.0114 8.77075L12.6019 4.71875H14.2284L12.0769 8.07765H15.1407Z"
                fill="#7BF179"
              />
            </svg>
          </div>
          <div className="text-sm font-medium text-dark-green-600">
            {canWithdraw ? (
              <button
                type="button"
                disabled={!canWithdraw}
                className="mt-1.5 flex items-center justify-center rounded-lg px-4 pt-1 pb-1.5 font-semibold focus:outline-none text-base active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 text-white bg-dark-green-600"
              >
                <span>Withdraw</span>
              </button>
            ) : (
              <div className="relative flex flex-col items-center justify-center mx-1 text-gray-500 group max-w-max bg-gray hover:text-sd-gray">
                <span className="text-sm font-medium text-sd-gray">
                  Withdrawal available in <br /> {withdrawalBlocksLeft} Bitcoin blocks
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

      <div className="flex items-center gap-3 py-2 mt-4 text-left">
        <div className="shrink-0">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="20" fill="#1E3731" />
            <path
              d="M23.9681 23.7946L28.3029 30.5625H25.0646L19.9759 22.6107L14.8872 30.5625H11.6661L16.0009 23.8122H9.78134V21.25H30.1876V23.7946H23.9681Z"
              fill="#7BF179"
            />
            <path
              d="M30.2813 16.1553V18.7322V18.75H9.78134V16.1553H15.909L11.6059 9.4375H14.859L20.0227 17.5415L25.2037 9.4375H28.4568L24.1538 16.1553H30.2813Z"
              fill="#7BF179"
            />
          </svg>
        </div>
        <div className="flex justify-between flex-grow">
          <div>
            <span className="text-lg font-semibold line-clamp-1 text-ellipsis">NFT #{id}</span>
            <span className="flex flex-wrap gap-1 -mt-1 text-sm text-secondary-text line-clamp-1">
              Cycle #{cycleId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
