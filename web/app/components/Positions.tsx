// @ts-nocheck

'use client'

import { callReadOnlyFunction, uintCV } from '@stacks/transactions'
import { useEffect, useState } from 'react'
import { useAppContext } from './AppContext'
import { ApyModal } from './ApyModal'
import { RatioModal } from './RatioModal'
import { UnstackPosition } from './UnstackPosition'
import { stacksNetwork, getRPCClient, coreApiUrl } from '../common/utils'
import Link from 'next/link'
import { useSTXAddress } from '../common/use-stx-address';

export function Positions() {
  const stxAddress = useSTXAddress();
  const { stStxBalance, stxBalance, stackingApy, bitcoinBlocksLeft } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [unstackNfts, setUnstackNfts] = useState([]);
  const [unstackNftData, setUnstackNftData] = useState({});
  const [currentCycleId, setCurrentCycleId] = useState(3);

  const getPoxCycle = async () => {
    const result = await callReadOnlyFunction({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
      contractName: 'stacking-dao-core-v1',
      functionName: 'get-pox-cycle',
      functionArgs: [],
      senderAddress: stxAddress,
      network: stacksNetwork
    });

    setCurrentCycleId(Number(result?.value));
  };

  useEffect(() => {
    const fetchNft = async (id: string) => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
        contractName: 'stacking-dao-core-v1',
        functionName: 'get-withdrawals-by-nft',
        functionArgs: [
          uintCV(id)
        ],
        senderAddress: stxAddress,
        network: stacksNetwork
      });

      const data = unstackNftData;
      data[id] = {
        'cycle-id': Number(result?.data['cycle-id']?.value),
        'ststx-amount': Number(result?.data['ststx-amount']?.value) / 1000000,
        'stx-amount': Number(result?.data['stx-amount']?.value) / 1000000
      };

      setUnstackNftData(data);
    }

    const fetchNftBalance = async () => {
      const identifier = `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.ststx-withdraw-nft::ststx-withdraw`;

      // Alternative
      // https://github.com/hirosystems/stacks-blockchain-api/pull/936
      const url = coreApiUrl + `/extended/v1/tokens/nft/holdings?principal=${stxAddress}&asset_identifiers[]=${identifier}`;
      const response = await fetch(url, { credentials: 'omit' });
      const data = await response.json();

      if (data['results']?.length > 0) {
        const arr = data['results'].map((el) => el['value']['repr'].replace('u', ''));
        setUnstackNfts(arr);

        for await (const id of arr) {
          await fetchNft(id);
        }
      }

      setIsLoading(false);
    }

    if (stxAddress) {
      fetchNftBalance();
      getPoxCycle();
    }
  }, [stxAddress]);

  return (
    <>
      {stxAddress && (
        <div className="w-full flex flex-col gap-1 mt-10">
          <span className="text-lg font-medium md:ml-6 md:mb-4 md:text-2xl">Active Positions</span>
          {stStxBalance > 0 && (
            <div role="button" tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
              <div className="pl-4 pr-3">
                <div className="flex gap-3 items-center text-left py-2">
                  <div className="w-10 h-10 relative flex-shrink-0">
                    <img alt="stSTX asset icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/sdao-logo.jpg" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
                  </div>
                  <div className="flex-grow flex justify-between">
                    <div>
                      <span className="text-lg font-semibold line-clamp-1 text-ellipsis">stSTX</span>
                      <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">StackingDAO Stacked STX</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">{stStxBalance.toLocaleString()} stSTX</div>
                      <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">{stackingApy}% APY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!isLoading && unstackNfts.map((id) => <UnstackPosition key={id} id={id} cycleId={unstackNftData[id]['cycle-id']} stStxAmount={unstackNftData[id]['ststx-amount']} stxAmount={unstackNftData[id]['stx-amount']} currentCycleId={currentCycleId} />)}
          {stxBalance > 0 && (
            <div role="button" tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
              <div className="pl-4 pr-3">
                <div className="flex gap-3 items-center text-left py-2">
                  <div className="w-10 h-10 relative flex-shrink-0">
                    <img alt="STX asset icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/stacks-stx-logo.png" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
                  </div>
                  <div className="flex-grow flex justify-between">
                    <div>
                      <span className="text-lg font-semibold line-clamp-1 text-ellipsis">STX</span>
                      <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">Stacks</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">{stxBalance.toLocaleString()} STX</div>
                      <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-tertiary-text">Not earning yield</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
