// @ts-nocheck

'use client'

import { callReadOnlyFunction, contractPrincipalCV, standardPrincipalCV, uintCV, cvToJSON } from '@stacks/transactions'
import { useEffect, useState } from 'react'
import { useAppContext } from './AppContext'
import { ApyModal } from './ApyModal'
import { RatioModal } from './RatioModal'
import { UnstackPosition } from './UnstackPosition'
import { stacksNetwork, getRPCClient, coreApiUrl, asyncForEach } from '../common/utils'
import Link from 'next/link'
import { useSTXAddress } from '../common/use-stx-address';

export function Positions() {
  const stxAddress = useSTXAddress();

  const { stStxBalance, stxBalance, stackingApy } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [unstackNfts, setUnstackNfts] = useState([]);
  const [unstackNftData, setUnstackNftData] = useState({});
  const [genesisNfts, setGenesisNfts] = useState([]);
  const [genesisNftInfo, setGenesisNftInfo] = useState({});
  const [currentCycleId, setCurrentCycleId] = useState(3);
  const [bitflowLpWallet, setBitflowLpWallet] = useState(0);
  const [bitflowLpStaked, setBitflowLpStaked] = useState(0);
  const [bitflowLpWallet2, setBitflowLpWallet2] = useState(0);
  const [bitflowLpStaked2, setBitflowLpStaked2] = useState(0);

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
  };

  const getNftInfo = async () => {
    const nftInfo = {};
    await asyncForEach(genesisNfts, async (nftId) => {
      const nftType = await fetchNftType(nftId);
      nftInfo[nftId] = {
        type: nftType,
        name: nftType == 0 ? 'Normal' : nftType == 1 ? 'OG' : nftType == 2 ? 'Gold' : 'Diamond',
        url: nftType == 0 ? '/genesis-nft.png' : nftType == 1 ? '/genesis-og.png' : nftType == 2 ? '/genesis-gold.png' : '/genesis-diamond.png'
      }
    });

    setGenesisNftInfo(nftInfo);
  };

  useEffect(() => {
    if (genesisNfts.length > 0) getNftInfo();
  }, [genesisNfts]);

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
        for await (const id of arr) {
          await fetchNft(id);
        }
        setUnstackNfts(arr);
      }

      setIsLoading(false);
    }

    const fetchGenesisBalance = async () => {
      const identifier = `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-dao-genesis-nft::stacking-dao-genesis`;
      const url = coreApiUrl + `/extended/v1/tokens/nft/holdings?principal=${stxAddress}&asset_identifiers[]=${identifier}`;
      const response = await fetch(url, { credentials: 'omit' });
      const data = await response.json();

      if (data['results']?.length > 0) {
        const arr = data['results'].map((el) => el['value']['repr'].replace('u', ''));
        setGenesisNfts(arr);
      }

      setIsLoading(false);
    }

    const fetchBitflowBalance = async () => {
      const resultWallet = await callReadOnlyFunction({
        contractAddress: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M",
        contractName: 'stx-ststx-lp-token-v-1-1',
        functionName: 'get-balance',
        functionArgs: [
          standardPrincipalCV(stxAddress)
        ],
        senderAddress: stxAddress,
        network: stacksNetwork
      });

      const resultWallet2 = await callReadOnlyFunction({
        contractAddress: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M",
        contractName: 'stx-ststx-lp-token-v-1-2',
        functionName: 'get-balance',
        functionArgs: [
          standardPrincipalCV(stxAddress)
        ],
        senderAddress: stxAddress,
        network: stacksNetwork
      });

      const resultStaked = await callReadOnlyFunction({
        contractAddress: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M",
        contractName: 'earn-stx-ststx-v-1-1',
        functionName: 'get-user-data',
        functionArgs: [
          contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, "ststx-token"),
          contractPrincipalCV("SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M", "stx-ststx-lp-token-v-1-1"),
          standardPrincipalCV(stxAddress)
        ],
        senderAddress: stxAddress,
        network: stacksNetwork
      });

      const resultStaked2 = await callReadOnlyFunction({
        contractAddress: "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M",
        contractName: 'earn-stx-ststx-v-1-2',
        functionName: 'get-user-data',
        functionArgs: [
          contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, "ststx-token"),
          contractPrincipalCV("SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M", "stx-ststx-lp-token-v-1-2"),
          standardPrincipalCV(stxAddress)
        ],
        senderAddress: stxAddress,
        network: stacksNetwork
      });

      const walletBalance = cvToJSON(resultWallet).value.value;
      const stakeBalance = cvToJSON(resultStaked).value ? cvToJSON(resultStaked).value.value["total-currently-staked"].value : 0;

      const walletBalance2 = cvToJSON(resultWallet2).value.value;
      const stakeBalance2 = cvToJSON(resultStaked2).value ? cvToJSON(resultStaked2).value.value["total-currently-staked"].value : 0;

      setBitflowLpWallet(Number(walletBalance) / 1000000);
      setBitflowLpStaked(Number(stakeBalance) / 1000000);
      setBitflowLpWallet2(Number(walletBalance2) / 1000000);
      setBitflowLpStaked2(Number(stakeBalance2) / 1000000);
    }


    if (stxAddress) {
      fetchNftBalance();
      fetchBitflowBalance();
      fetchGenesisBalance();
      getPoxCycle();
    }
  }, [stxAddress]);

  return (
    <>
      {stxAddress && (
        <div className="w-full flex flex-col gap-1 mt-10 mb-10">
          <span className="text-lg font-medium md:mb-4 md:text-2xl">Active Positions</span>
          
          {/* stSTX */}
          {stStxBalance > 0 && (
            <div tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
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
                    <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                      {stStxBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} 
                      {' '}stSTX</div>
                    <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">{stackingApy}% APY</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdraw NFT */}
          {!isLoading && unstackNfts.map((id) => <UnstackPosition key={id} id={id} cycleId={unstackNftData[id]['cycle-id']} stStxAmount={unstackNftData[id]['ststx-amount']} stxAmount={unstackNftData[id]['stx-amount']} currentCycleId={currentCycleId} />)}

          {/* Genesis NFT */}
          {!isLoading && genesisNfts.map((id) => <>
            <div tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
              <div className="flex gap-3 items-center text-left py-2">
                <div className="w-10 h-10 relative flex-shrink-0">
                  <img alt="Stacking Genesis NFT icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src={genesisNftInfo[id]?.url} style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
                </div>
                <div className="flex-grow flex justify-between">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">Genesis {genesisNftInfo[id]?.name} NFT</span>
                    <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">Stacking DAO Genesis NFT</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                      🎇🎇🎇
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                      Special Points Multiplier
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>)}

          {/* BitFlow LP V1.1 */}
          {bitflowLpStaked > 0 && (
            <div tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
              <div className="flex gap-3 items-center text-left py-2">
                <div className="w-10 h-10 relative flex-shrink-0">
                  <img alt="stSTX/STX LP Bitflow icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/bitflow-logo.png" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
                </div>
                <div className="flex-grow flex justify-between">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">STX/stSTX v1.1</span>
                    <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">Staked liquidity on Bitflow</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                      {bitflowLpStaked.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} 
                      {' '} STX-stSTX-LP
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                      stSTX yield + yield on Bitflow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {bitflowLpWallet > 0 && (
            <div tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
              <div className="flex gap-3 items-center text-left py-2">
                <div className="w-10 h-10 relative flex-shrink-0">
                  <img alt="stSTX/STX LP Bitflow icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/bitflow-logo.png" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
                </div>
                <div className="flex-grow flex justify-between">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">STX/stSTX v1.1</span>
                    <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">Liquidity on Bitflow</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                      {bitflowLpWallet.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} 
                      {' '} STX-stSTX-LP
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                      stSTX yield + yield on Bitflow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BitFlow LP V1.2 */}
          {bitflowLpStaked2 > 0 && (
            <div tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
              <div className="flex gap-3 items-center text-left py-2">
                <div className="w-10 h-10 relative flex-shrink-0">
                  <img alt="stSTX/STX LP Bitflow icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/bitflow-logo.png" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
                </div>
                <div className="flex-grow flex justify-between">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">STX/stSTX v1.2</span>
                    <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">Staked liquidity on Bitflow</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                      {bitflowLpStaked2.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} 
                      {' '} STX-stSTX-LP
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                      stSTX yield + yield on Bitflow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {bitflowLpWallet2 > 0 && (
            <div tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
              <div className="flex gap-3 items-center text-left py-2">
                <div className="w-10 h-10 relative flex-shrink-0">
                  <img alt="stSTX/STX LP Bitflow icon" loading="lazy" decoding="async" data-nimg="fill" className="rounded-full" src="/bitflow-logo.png" style={{'position': 'absolute', 'height': '100%', 'width': '100%', 'inset': '0px', 'color': 'transparent'}} />
                </div>
                <div className="flex-grow flex justify-between">
                  <div>
                    <span className="text-lg font-semibold line-clamp-1 text-ellipsis">STX/stSTX v1.2</span>
                    <span className="text-sm text-secondary-text line-clamp-1 flex gap-1 flex-wrap">Liquidity on Bitflow</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                      {bitflowLpWallet2.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} 
                      {' '} STX-stSTX-LP
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-ststx">
                      stSTX yield
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* STX */}
          {stxBalance > 0 && (
            <div tabIndex="0" className="bg-white rounded-xl w-full" style={{'WebkitTapHighlightColor': 'transparent'}}>
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
                    <div className="text-lg font-semibold whitespace-nowrap line-clamp-1">
                      {stxBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} 
                      {' '}STX</div>
                    <span className="text-sm font-medium whitespace-nowrap line-clamp-1 text-tertiary-text">Not earning yield</span>
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
