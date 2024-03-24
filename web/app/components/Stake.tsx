// @ts-nocheck

'use client';

import { Fragment, useEffect, useState } from 'react';
import { Placeholder } from './Placeholder';
import { StyledIcon } from './StyledIcon';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { useAppContext } from './AppContext/AppContext';
import {
  callReadOnlyFunction,
  standardPrincipalCV,
  makeContractSTXPostCondition,
  FungibleConditionCode,
} from '@stacks/transactions';
import { stacksNetwork } from '../common/utils';
import { StakeModal } from '../components/StakeModal';
import { UnstakeModal } from '../components/UnstakeModal';
import { useSTXAddress } from '../common/use-stx-address';
import { makeContractCall } from '../common/contract-call';

export function Stake() {
  const stxAddress = useSTXAddress();
  const { sDaoBalance, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const contractAddress = process.env.NEXT_PUBLIC_STSTX_ADDRESS || '';

  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [earnedRewards, setEarnedRewards] = useState<number>(0);
  const [stakedTokens, setStakedTokens] = useState<number>(0);
  const [totalStakedTokens, setTotalStakedTokens] = useState<number>(0);
  // TODO: calculate real APY
  // Using rewards-per-block, sDAO and STX price we can calculate this
  const [apr, setApr] = useState<number>(5.5);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [showUnstakeModal, setShowUnstakeModal] = useState<boolean>(false);

  const claimRewards = async () => {
    const postCondition = makeContractSTXPostCondition(
      process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      'staking-v1',
      FungibleConditionCode.GreaterEqual,
      0n
    );

    await makeContractCall(
      {
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'staking-v1',
        functionName: 'claim-pending-rewards',
        functionArgs: [],
        postConditions: [postCondition],
        network: stacksNetwork,
      },
      async (error?, txId?) => {
        setCurrentTxId(txId);
        setCurrentTxStatus('pending');
      }
    );
  };

  useEffect(() => {
    const fetchStakingData = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'staking-v1',
        functionName: 'get-pending-rewards',
        functionArgs: [standardPrincipalCV(stxAddress)],
        senderAddress: stxAddress,
        network: stacksNetwork,
      });

      setEarnedRewards(Number(result?.value?.value) / 1000000);
    };

    const fetchStakedTokens = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'staking-v1',
        functionName: 'get-stake-of',
        functionArgs: [standardPrincipalCV(stxAddress)],
        senderAddress: stxAddress,
        network: stacksNetwork,
      });

      setStakedTokens(Number(result?.data?.amount?.value) / 1000000);
    };

    const fetchTotalStakedTokens = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'staking-v1',
        functionName: 'get-total-staked',
        functionArgs: [],
        senderAddress: stxAddress,
        network: stacksNetwork,
      });

      setTotalStakedTokens(Number(result?.value) / 1000000);
    };

    if (stxAddress) {
      fetchStakingData();
      fetchStakedTokens();
      fetchTotalStakedTokens();
    }
  }, [stxAddress]);

  return (
    <>
      <StakeModal showStakeModal={showStakeModal} setShowStakeModal={setShowStakeModal} apy={apr} />
      <UnstakeModal
        showUnstakeModal={showUnstakeModal}
        setShowUnstakeModal={setShowUnstakeModal}
        stakedAmount={stakedTokens}
      />

      <section className="relative mt-8">
        <header className="pb-5 sm:flex sm:justify-between sm:items-end">
          <div>
            <h3 className="text-lg leading-6 text-gray-900 font-headings">sDAO Staking</h3>
            <p className="max-w-3xl mt-2 text-sm text-gray-500">
              The staking pool is a <span className="font-semibold">revenue share</span> pool where
              you receive STX from the protocol. The STX tokens are earned through a commission of{' '}
              <span className="font-semibold">5%</span> of the yield from Proof of Transfer.
            </p>
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            <div className="w-5.5 h-5.5 rounded-full bg-white flex items-center justify-center">
              <StyledIcon as="QuestionMarkCircleIcon" size={5} className="text-ststx" />
            </div>
            <a
              className="inline-flex items-center px-2 text-sm font-medium text-ststx"
              href="https://docs.arkadiko.finance/protocol/auctions/liquidation-pool"
              target="_blank"
              rel="noopener noreferrer"
            >
              More on revenue share staking
              <StyledIcon as="ExternalLinkIcon" size={3} className="block ml-2" />
            </a>
          </div>
        </header>

        <div className="mt-4 bg-white rounded-md shadow">
          <div className="px-4 py-5 space-y-6 sm:p-6">
            <div className="md:grid md:grid-flow-col gap-4 sm:grid-cols-[min-content,auto]">
              <div className="self-center w-14">
                <img
                  className="w-12 h-12 rounded-full"
                  src="/sdao-logo.jpg"
                  alt="StackingDAO logo"
                />
              </div>
              <div className="mt-3 md:mt-0">
                <p className="text-sm leading-6 text-gray-500 md:mb-1">Your staked sDAO tokens</p>
                {loadingData ? (
                  <Placeholder className="py-2" width={Placeholder.width.HALF} />
                ) : (
                  <div>
                    <p className="text-lg font-semibold">{stakedTokens} sDAO</p>
                  </div>
                )}
              </div>
              <div className="mt-3 md:mt-0">
                <p className="text-sm leading-6 text-gray-500 md:mb-1">Total Staked</p>
                {loadingData ? (
                  <Placeholder className="py-2" width={Placeholder.width.HALF} />
                ) : (
                  <div>
                    <p className="text-lg font-semibold">{totalStakedTokens} sDAO</p>
                  </div>
                )}
              </div>
              <div className="mt-3 md:mt-0">
                <p className="text-sm leading-6 text-gray-500 md:mb-1">Earned STX</p>
                {loadingData ? (
                  <Placeholder className="py-2" width={Placeholder.width.HALF} />
                ) : (
                  <div>
                    <p className="text-lg font-semibold">{earnedRewards} STX</p>
                  </div>
                )}
              </div>
              <div className="mt-3 md:mt-0">
                <p className="text-sm leading-6 text-gray-500 md:mb-1">Current APR</p>
                {loadingData ? (
                  <Placeholder className="py-2" width={Placeholder.width.HALF} />
                ) : (
                  <p className="text-ststx">{apr}%</p>
                )}
              </div>

              <div className="self-center">
                <Menu as="div" className="relative flex items-center justify-end">
                  {({ open }) => (
                    <>
                      <Menu.Button className="inline-flex items-center justify-center px-2 py-1 text-sm text-ststx bg-white rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                        <span>Actions</span>
                        <StyledIcon
                          as="ChevronUpIcon"
                          size={4}
                          className={`${
                            open ? '' : 'transform rotate-180 transition ease-in-out duration-300'
                          } ml-2`}
                        />
                      </Menu.Button>
                      <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          static
                          className="absolute right-0 z-10 w-48 mx-3 mt-6 origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg top-2 ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <div className="px-1 py-1 space-y-0.5">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active ? 'button-ststx text-white' : 'text-gray-900'
                                  } group flex rounded-md items-center w-full px-2 py-2 text-sm disabled:text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                                  disabled={!(sDaoBalance > 0)}
                                  onClick={() => setShowStakeModal(true)}
                                >
                                  {!(sDaoBalance > 0) ? (
                                    <a href="#" className="mr-2">
                                      <div className="flex items-center w-full">
                                        <StyledIcon
                                          as="ArrowCircleDownIcon"
                                          size={5}
                                          className="block mr-3 text-gray-400"
                                        />
                                        Stake
                                      </div>
                                      <span className="tooltip">
                                        You don&apos;t have any available sDAO to stake in your
                                        wallet.
                                      </span>
                                    </a>
                                  ) : (
                                    <>
                                      <StyledIcon
                                        as="ArrowCircleDownIcon"
                                        size={5}
                                        className="block mr-3 text-gray-400 group-hover:text-white"
                                      />
                                      Stake
                                    </>
                                  )}
                                </button>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active ? 'button-ststx text-white' : 'text-gray-900'
                                  } group flex rounded-md items-center w-full px-2 py-2 text-sm disabled:text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                                  onClick={() => setShowUnstakeModal(true)}
                                  disabled={stakedTokens === 0}
                                >
                                  <>
                                    <StyledIcon
                                      as="ArrowCircleUpIcon"
                                      size={5}
                                      className="mr-3 text-gray-400 group-hover:text-white"
                                    />
                                    Unstake
                                  </>
                                </button>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                                  } group flex rounded-md items-center w-full px-2 py-2 text-sm disabled:text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                                  onClick={() => claimRewards()}
                                  disabled={earnedRewards === 0}
                                >
                                  <>
                                    <StyledIcon
                                      as="CurrencyRupeeIcon"
                                      size={5}
                                      className="mr-3 text-gray-400 group-hover:text-white"
                                    />
                                    Claim STX Rewards
                                  </>
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
