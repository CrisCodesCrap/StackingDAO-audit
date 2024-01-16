// @ts-nocheck

'use client'

import { useEffect, useState } from 'react';
import { Container } from '../components/Container'
import { useSTXAddress } from '../common/use-stx-address';
import { PointsModal } from '../components/PointsModal'
import { coreApiUrl } from '../common/utils';

export default function Points() {
  const stxAddress = useSTXAddress();

  const [buttonText, setButtonText] = useState('Copy your referral link');
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [pointsInfo, setPointsInfo] = useState({ user_points: 0, referral_points: 0 });
  const [totalPoints, setTotalPoints] = useState(0);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://app.stackingdao.com/stack?referral=${stxAddress}`);
    setButtonText('Link copied!');
  };

  async function fetchBlockInfo() {
    const lastBlockResponse = await fetch("https://stackingdao-points.s3.amazonaws.com/points-last-block.json");
    const lastBlock = (await lastBlockResponse.json()).last_block;

    const blockHeightResponse = await fetch(`${coreApiUrl}/v2/info`, { json: true });
    const blockHeight = (await blockHeightResponse.json())['stacks_tip_height'];

    const daysDiff = (blockHeight - lastBlock) / 144;
    console.log("Update info. Current block:", blockHeight, ", last block:", lastBlock, ", days diff:", daysDiff)
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

    if (!stxAddress) return;
    const userData = data[stxAddress];
    setPointsInfo(userData || { user_points: 0, referral_points: 0 });
  }

  useEffect(() => {
    if (stxAddress) {
      fetchPointsInfo();
    }
    fetchBlockInfo();
  }, [stxAddress]);

  return (
    <Container className="mt-12">
      <div className="py-10">
        <div className="w-full text-center hidden md:block font-semibold text-4xl my-3">StackingDAO Points</div>
        <div className="w-full text-center text-sm">We reserve the right to update point calculations at any time. Points are updated weekly.</div>
        {showPointsInfo && (
          <PointsModal open={showPointsInfo} setOpen={setShowPointsInfo} />
        )}

        {stxAddress ? (
          <div>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
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
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalPoints.toLocaleString()}</dd>
              </div>

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
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{(pointsInfo.user_points + pointsInfo.referral_points).toLocaleString()}</dd>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">Your Stacking Points</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{pointsInfo.user_points.toLocaleString()}</dd>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">Your Referral Points</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{pointsInfo.referral_points.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        ):(
          <>
            <div className="w-full text-center hidden md:block text-lg my-8">Connect your wallet to view your points</div>
          </>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="flex gap-2 items-center mt-6 justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full mb-2"
            onClick={() => { setShowPointsInfo(true)}}
          >
            How do points work?
          </button>

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

        <div className="w-full text-center text-sm my-8">A searchable leaderboard is coming soon.</div>

        {/*<table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-full sm:w-4/12" />
            <col className="lg:w-4/12" />
            <col className="lg:w-4/12" />
          </colgroup>
          <thead className="border-b border-white/10 text-sm leading-6 text-neutral-800">
            <tr>
              <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">Rank</th>
              <th scope="col" className="py-2 pl-0 pr-8 font-semibold sm:table-cell">User</th>
              <th scope="col" className="py-2 pl-0 pr-8 font-semibold sm:table-cell">Stacking Points</th>
              <th scope="col" className="py-2 pl-0 pr-8 font-semibold sm:table-cell">Referral Points</th>
              <th scope="col" className="py-2 pl-0 pr-8 font-semibold sm:table-cell">Total Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                1
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">71,897</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">0</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">71,897</div>
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                2
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">arkadiko.btc</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">0</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">0</div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-normal text-sm leading-6">0</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>*/}
      </div>
    </Container>
  )
}
