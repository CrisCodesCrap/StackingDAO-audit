// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { Container } from '../components/Container';
import { useSTXAddress } from '../common/use-stx-address';
import {
  callReadOnlyFunction,
  createAssetInfo,
  standardPrincipalCV,
  uintCV,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
} from '@stacks/transactions';
import { stacksNetwork, coreApiUrl, resolveProvider } from '../common/utils';
import { useAppContext } from '../components/AppContext/AppContext';
import { useConnect } from '@stacks/connect-react';

export default function Genesis() {
  const stxAddress = useSTXAddress();
  const { setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const { doContractCall } = useConnect();

  const [startedLoading, setStartedLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canClaim, setCanClaim] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(true);

  // const fetchNftBalance = async () => {
  //   const identifier = `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-dao-genesis-nft::stacking-dao-genesis`;
  //   const url = coreApiUrl + `/extended/v1/tokens/nft/holdings?principal=${stxAddress}&asset_identifiers[]=${identifier}`;
  //   const response = await fetch(url, { credentials: 'omit' });
  //   const data = await response.json();
  //   hasClaimed(true);
  // }

  const fetchHasClaimed = async () => {
    const result = await callReadOnlyFunction({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
      contractName: 'stacking-dao-genesis-nft-minter-v2',
      functionName: 'has-claimed',
      functionArgs: [standardPrincipalCV(stxAddress)],
      senderAddress: stxAddress,
      network: stacksNetwork,
    });

    const hasClaimed = Number(result?.type) === 3;
    setHasClaimed(hasClaimed);
  };

  const fetchCanClaim = async () => {
    const result = await callReadOnlyFunction({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS || '',
      contractName: 'stacking-dao-genesis-nft-minter-v2',
      functionName: 'can-claim',
      functionArgs: [standardPrincipalCV(stxAddress)],
      senderAddress: stxAddress,
      network: stacksNetwork,
    });

    const canClaim = Number(result?.type) === 3;
    setCanClaim(canClaim);
    if (canClaim) await fetchHasClaimed();

    return result?.type;
  };

  const fetchData = async () => {
    await fetchCanClaim();
    setIsLoading(false);
  };

  const claimNft = async () => {
    if (!canClaim) return;

    const postConditions = [
      makeStandardNonFungiblePostCondition(
        stxAddress!,
        NonFungibleConditionCode.Sends,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'stacking-dao-genesis-nft',
          'stacking-dao-genesis'
        ),
        uintCV(1)
      ),
    ];

    await doContractCall(
      {
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'stacking-dao-genesis-nft-minter-v2',
        functionName: 'claim',
        functionArgs: [],
        network: stacksNetwork,
        onFinish: async data => {
          setCurrentTxId(data.txId);
          setCurrentTxStatus('pending');
        },
      },
      resolveProvider() || window.StacksProvider
    );
  };

  useEffect(() => {
    if (!stxAddress) return;
    if (startedLoading) return;
    setStartedLoading(true);

    fetchData();
  }, [stxAddress]);

  return (
    <Container className="mt-12">
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-ststx">
              A special genesis NFT for our earliest adopters
            </h2>

            {isLoading ? (
              <div role="status" className="flex text-center flex-col items-center mt-8">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-700"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <>
                {canClaim && hasClaimed ? (
                  <span>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                      🏆🏆🏆
                    </h1>
                    <h2 className="mt-6 text-lg font-semibold text-gray-600">
                      Congrats on claiming your NFT.
                    </h2>
                    <p className="mt-1 text-lg font-semibold text-gray-600">
                      A secret multiplier will be applied to your points later.
                    </p>
                    <img src="/genesis-nft.png" className="flex flex-col items-center mt-8" />
                  </span>
                ) : canClaim ? (
                  <span>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                      🎇🎇🎇
                    </h1>
                    <h2 className="mt-6 text-xl font-semibold text-gray-600">
                      Congrats, you are eligible for the Genesis NFT claim.
                    </h2>
                    <button
                      className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg button-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 my-4 w-full mt-14"
                      onClick={() => claimNft()}
                    >
                      Claim NFT
                    </button>
                  </span>
                ) : (
                  <span>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                      :(
                    </h1>
                    <h2 className="mt-6 text-xl font-semibold text-gray-600">
                      Sorry, you are not eligible for the Genesis NFT claim.
                    </h2>
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
