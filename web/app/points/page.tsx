// @ts-nocheck

'use client'

import { useState } from 'react'
import { Container } from '../components/Container'
import { useSTXAddress } from '../common/use-stx-address';
import { PointsModal } from '../components/PointsModal'

export default function Points() {
  const stxAddress = useSTXAddress();
  const [buttonText, setButtonText] = useState('Copy your referral link');
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://app.stackingdao.com/stack?referral=${stxAddress}`);
    setButtonText('Link copied!');
  };

  return (
    <Container className="mt-12">
      <div className="py-10">
        <div className="w-full text-center hidden md:block font-semibold text-4xl my-8">StackingDAO Points</div>
        {showPointsInfo && (
          <PointsModal open={showPointsInfo} setOpen={setShowPointsInfo} />
        )}

        <div>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Points</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Soon</dd>
            </div>

            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Stacking Points</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Soon</dd>
            </div>

            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Referral Points</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Soon</dd>
            </div>
          </dl>
        </div>

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
