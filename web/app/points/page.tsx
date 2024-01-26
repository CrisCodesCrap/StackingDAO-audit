// @ts-nocheck

'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link'
import { Container } from '../components/Container'
import { useSTXAddress } from '../common/use-stx-address';
import { PointsModal } from '../components/PointsModal'
import { callReadOnlyFunction, uintCV } from '@stacks/transactions'
import { stacksNetwork, coreApiUrl } from '../common/utils'
import { WalletConnectButton } from '../components/WalletConnectButton';

export default function Points() {
  const stxAddress = useSTXAddress();

  const [buttonText, setButtonText] = useState('Copy your referral link');
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [pointsInfo, setPointsInfo] = useState({ user_points: 0, referral_points: 0 });
  const [userRank, setUserRank] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [nftType, setNftType] = useState(-1);
  const [lastUpdateBlock, setLastUpdateBlock] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [showReadMore, setShowReadMore] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://app.stackingdao.com/stack?referral=${stxAddress}`);
    setButtonText('Link copied!');
  };

  const addUserToFrontOfList = (searchValue: string, allUsers: any[], list: any[]) => {
    if (stxAddress) {
      const currentUser = allUsers.filter(user => user[0] == stxAddress);
      const currentIndex = list.indexOf(currentUser[0]);

      if (stxAddress != searchValue && (currentIndex > 2 || currentIndex < 0)) {
        return currentUser.concat(list);
      }
    }
    return list;
  }

  const searchValueChangedHelper = async (value: string) => {
    setSearchValue(value);
    if (value == "") {
      setTopUsers(addUserToFrontOfList(value, allUsers, allUsers.slice(0, 100)));
    } else {
      const user = allUsers.filter(user => user[0] == value);
      const index = allUsers.indexOf(user[0]);
      setTopUsers(addUserToFrontOfList(value, allUsers, allUsers.slice((Math.max(0, index-3)), index+97)));
    }
  }

  const searchValueChanged = (event: { target: { value: SetStateAction<string>; }; }) => {
    searchValueChangedHelper(event.target.value);
  };

  const clearUser = async () => {
    searchValueChangedHelper("");
  }

  async function fetchBlockInfo() {
    const lastBlockResponse = await fetch("https://stackingdao-points.s3.amazonaws.com/points-last-block.json");
    const lastBlock = (await lastBlockResponse.json()).last_block;

    const blockHeightResponse = await fetch(`${coreApiUrl}/extended/v2/blocks/${lastBlock}`, { json: true });
    const blockTime = (await blockHeightResponse.json())['burn_block_time_iso'];

    console.log("lastBlock:", lastBlock, "blockTime:", blockTime), 
    setLastUpdateBlock(blockTime);
  }

  async function fetchPointsInfo() {
    const url = "https://stackingdao-points.s3.amazonaws.com/points-aggregate.json";
    const response = await fetch(url);
    const data = await response.json();

    const sumWithInitial = Object.values(data).reduce(
      (accumulator, currentValue) => accumulator + currentValue['user_points'],
      0,
    );
    setTotalPoints(sumWithInitial);

    // Sort the data for the leaderboard
    var items = Object.keys(data).map(function(key) {
      return [key, data[key]];
    });
    items.sort(function(first, second) {
      return (second[1].user_points + second[1].referral_points) - (first[1].user_points + first[1].referral_points);
    });
    setAllUsers(items);
    setTopUsers(items.slice(0, 100));

    if (!stxAddress) return;
    const userData = data[stxAddress];
    setPointsInfo(userData || { user_points: 0, referral_points: 0 });

    const currentUser = items.filter(user => user[0] == stxAddress);
    const currentIndex = items.indexOf(currentUser[0]);
    setUserRank(currentIndex+1)
    setTopUsers(addUserToFrontOfList(searchValue, items, items.slice(0, 100)));
  }

  const fetchNftType = async (id: string) => {
    const result = await callReadOnlyFunction({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
      contractName: 'stacking-dao-genesis-nft',
      functionName: 'get-genesis-type',
      functionArgs: [
        uintCV(id)
      ],
      senderAddress: stxAddress,
      network: stacksNetwork
    });

    return Number(result?.value);
  }

  const fetchNftBalance = async () => {
    const identifier = `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-dao-genesis-nft::stacking-dao-genesis`;
    const url = coreApiUrl + `/extended/v1/tokens/nft/holdings?principal=${stxAddress}&asset_identifiers[]=${identifier}`;
    const response = await fetch(url, { credentials: 'omit' });
    const data = await response.json();

    if (data['results']?.length > 0) {
      const ids = data['results'].map((el) => el['value']['repr'].replace('u', ''));
      const types = await Promise.all(ids.map(id => fetchNftType(id)));
      const maxType = Math.max(types);
      setNftType(maxType);
    }
  }

  useEffect(() => {
    if (stxAddress) {
      fetchNftBalance();
    }
    fetchPointsInfo();
    fetchBlockInfo();
  }, [stxAddress]);

  return (
    <Container className="mt-12">
      <div className="py-10">
        <div className="w-full text-center font-semibold text-4xl my-3">StackingDAO Points</div>
        <div className="w-full text-center text-sm text-gray-500">
          We reserve the right to update point calculations at any time. 
        </div>
        <div className="w-full text-center text-sm text-gray-500">
          Points are updated every 2 days. Last updated on {' '}
          <span className='font-semibold'>
            {(new Date(lastUpdateBlock).toLocaleString())}
          </span>
          {' '}({Intl.DateTimeFormat().resolvedOptions().timeZone}). 
        </div>
        {showPointsInfo && (
          <PointsModal open={showPointsInfo} setOpen={setShowPointsInfo} />
        )}

        {stxAddress ? (
          <div>
            <dl className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-4">
              <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="text-sm font-medium text-gray-500 flex block gap-1">
                  Your Points
                  <a className="group max-w-max relative mx-1 bg-gray flex flex-col items-center justify-center text-gray-500 hover:text-gray-600" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <div className="[transform:perspective(50px)_translateZ(0)_rotateX(10deg)] group-hover:[transform:perspective(0px)_translateZ(0)_rotateX(0deg)] absolute bottom-0 mb-6 origin-bottom transform rounded text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <div className="flex max-w-xs flex-col items-center w-32">
                        <div className="rounded bg-gray-900 p-2 text-xs text-center shadow-lg">The sum of Your Stacking Points and Your Referral Points</div>
                        <div className="clip-bottom h-2 w-4 bg-gray-900"></div>
                      </div>
                    </div>
                  </a>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex">
                  {(pointsInfo.user_points + pointsInfo.referral_points).toLocaleString(undefined, { maximumFractionDigits: 0 })}

                  {nftType >= 0 ? (
                    <>
                      <div className="ml-2 text-bottom text-gray-500">*</div>
                      <a className="group max-w-max relative mx-1 bg-gray flex flex-col items-center justify-center text-gray-500 hover:text-gray-600" href="#">
                        {nftType == 1 ? (
                          <>😎</>
                        ): nftType == 2 ? (
                          <>✨</>
                        ): nftType == 3 ? (
                          <>💎</>
                        ):(
                          <>🚀</>
                        )}
                        <div className="[transform:perspective(50px)_translateZ(0)_rotateX(10deg)] group-hover:[transform:perspective(0px)_translateZ(0)_rotateX(0deg)] absolute bottom-0 mb-6 origin-bottom transform rounded text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <div className="flex max-w-xs flex-col items-center w-64">
                            <div className="rounded bg-gray-900 p-2 text-xs text-center shadow-lg">
                              {nftType == 1 ? (
                                <>LFG! You&apos;re holding a Stacking DAO OG Genesis NFT.</>
                              ): nftType == 2 ? (
                                <>Wow, you&apos;re lucky! You&apos;re holding a 1 of 100 Stacking DAO Gold Genesis NFT.</>
                              ): nftType == 3 ? (
                                <>OMG. You&apos;re the special one! You&apos;re holding a 1 of 1 a Stacking DAO Diamond Genesis NFT.</>
                              ):(
                                <>LFG! You&apos;re holding a Stacking DAO Genesis NFT.</>
                              )}
                              {' '} A secret multiplier will be applied on your points later!
                            </div>
                            <div className="clip-bottom h-2 w-4 bg-gray-900"></div>
                          </div>
                        </div>
                      </a>
                    </>
                  ): null}

                </dd>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">Your Stacking Points</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{pointsInfo.user_points.toLocaleString(undefined, { maximumFractionDigits: 0 })}</dd>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">Your Referral Points</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{pointsInfo.referral_points.toLocaleString(undefined, { maximumFractionDigits: 0 })}</dd>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">Your Rank</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {userRank == -1 ? (
                    <>N/A</>
                  ):(
                    <>
                      #{userRank.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </>
                  )}
                </dd>
              </div>
            </dl>

            
          </div>
        ):(
          <>
            <div className="w-full text-center text-lg my-8">
              <div className='pb-2'>Connect your wallet to view your points.</div>
              <WalletConnectButton/>
            </div>
          </>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 flex block gap-1">
              Total Points
              <a className="group max-w-max relative mx-1 bg-gray flex flex-col items-center justify-center text-gray-500 hover:text-gray-600" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                <div className="[transform:perspective(50px)_translateZ(0)_rotateX(10deg)] group-hover:[transform:perspective(0px)_translateZ(0)_rotateX(0deg)] absolute bottom-0 mb-6 origin-bottom transform rounded text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <div className="flex max-w-xs flex-col items-center w-32">
                    <div className="rounded bg-gray-900 p-2 text-xs text-center shadow-lg">Total Points accumulated in the protocol so far</div>
                    <div className="clip-bottom h-2 w-4 bg-gray-900"></div>
                  </div>
                </div>
              </a>
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })}</dd>
          </div>

          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {allUsers.length.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </dd>
          </div>
        </dl>

        <div className="flex gap-2 mt-4">
          {stxAddress && (
            <button
              type="button"
              className="flex gap-2 items-center mt-6 justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full mb-2"
              onClick={() => copyLink() }
            >
              {buttonText}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 013.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0121 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 017.5 16.125V3.375z" />
                <path d="M15 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0017.25 7.5h-1.875A.375.375 0 0115 7.125V5.25zM4.875 6H6v10.125A3.375 3.375 0 009.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V7.875C3 6.839 3.84 6 4.875 6z" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-12">
          <div className="w-full font-semibold text-2xl my-3">How do points work?</div>
          <p className="text-sm text-gray-500 mb-2">
            StackingDAO Points are designed to quantify and reward your contributions to the ever-growing StackingDAO ecosystem.
          </p>

          {!showReadMore ? (
            <button
              type="button"
              className="text-ststx font-semibold text-sm"
              onClick={() => setShowReadMore(true) }
            >
              Read More
            </button>
          ):(
            <>
              <p className="text-sm text-gray-500 mb-2">
                You can earn points through holding stSTX, participating in DeFi activities or making referrals, and more.
                The math is simple, transparent, and designed to benefit everyone from long-term holders to active DeFi users.
              </p>

              <h2 className="text-lg mt-6">How to Earn Points</h2>
              <h2 className="text-md mt-4">Holding stSTX</h2>
              <p className="text-sm text-gray-500 mb-2">
                For those of you holding onto stSTX, your faith in the ecosystem will be rewarded. Every stSTX in your wallet accumulates 1 point per day.
                The points will be calculated based on a daily snapshot of your stSTX holdings.

                For example, holding 1000 stSTX will earn you 1000 points each day, and the longer you hold, the more you accumulate.
              </p>

              <h2 className="text-md mt-4">DeFi Activities with stSTX</h2>
              <p className="text-sm text-gray-500 mb-2">
                If you&apos;re an active participant in the DeFi world, your engagement will also earn you extra points. For those lending your stSTX you will collect 1.5 points per stSTX per day. You can earn 2.5 points for stSTX/STX LPs.

                We are only tracking DeFi platforms with an aggregate TVL that is greater than a minimum threshold that ensures meaningful liquidity on the platform.
                As such we are currently tracking ALEX, Arkadiko and Bitflow
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Please reach out to us if you believe we should add a protocol that is missing from our list.
              </p>

              <h2 className="text-md mt-4">Referrals</h2>
              <p className="text-sm text-gray-500 mb-2">
                For our community builders out there, we haven’t forgotten you. Refer a friend to join the StackingDAO ecosystem, and you&apos;ll gain 10% of the points they earn.

                For example, if your referee earns 1000 points, you get 100 points.
              </p>

              <h2 className="text-md mt-4">OG and Genesis NFTs</h2>
              <p className="text-sm text-gray-500 mb-2">
                For holders of OG and Genesis NFTs, we have a special points multiplier in store. Have you accumulated a lot of points? Congrats, you will get even more points!
              </p>
            </>
          )}
        </div>

        <div className="mt-12">
          <div className="w-full font-semibold text-2xl my-3">Leaderboard</div>
          <p className="text-sm text-gray-500 mb-2">
            A list of users sorted by points earned. Enter an address below to view its information.
          </p>

          <div className='flex'>
            <input
              type="text"
              name="last-name"
              id="last-name"
              autoComplete="family-name"
              placeholder="SP...."
              value={searchValue}
              onChange={evt => searchValueChanged(evt)}
              className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
            />
            <button
              type="button"
              className="ml-6 items-center justify-center rounded-full px-6 font-bold focus:outline-none text-sm bg-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50"
              onClick={() => clearUser() }
            >
              Clear
            </button>
          </div>

        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Rank
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        User
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Stacking Points
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Referral Points
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Total Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topUsers.map((user) => (
                      <tr key={topUsers.indexOf(user) + Math.random()} className={user[0] == searchValue ? "bg-light-ststx" : "bg-white"}>
                        <td className="whitespace-nowrap pl-6 text-sm font-medium text-gray-900">
                          {allUsers.indexOf(user) == 0 ? (
                            <span className='text-2xl'>🥇</span>
                          ): allUsers.indexOf(user) == 1 ? (
                            <span className='text-2xl'>🥈</span>
                          ): allUsers.indexOf(user) == 2 ? (
                            <span className='text-2xl'>🥉</span>
                          ): (
                            <span className='pl-2'>{allUsers.indexOf(user)+1}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <Link href={`https://explorer.hiro.so/address/${user[0]}?chain=mainnet`} rel="noopener noreferrer" target="_blank">
                            <div className={user[0] == stxAddress ? "flex text-ststx font-medium" : "flex text-gray-500 font-normal"}>
                              {user[0]}
                              {user[0] == stxAddress ? (
                                <>{' '}(You)</>
                              ): null}
                              <div className='pl-2 pt-1'>
                                <svg className="w-3 h-3 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                  <path d="M17 0h-5.768a1 1 0 1 0 0 2h3.354L8.4 8.182A1.003 1.003 0 1 0 9.818 9.6L16 3.414v3.354a1 1 0 0 0 2 0V1a1 1 0 0 0-1-1Z"/>
                                  <path d="m14.258 7.985-3.025 3.025A3 3 0 1 1 6.99 6.768l3.026-3.026A3.01 3.01 0 0 1 8.411 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V9.589a3.011 3.011 0 0 1-1.742-1.604Z"/>
                                </svg>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user[1].user_points.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user[1].referral_points.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {(user[1].user_points + user[1].referral_points).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Container>
  )
}
