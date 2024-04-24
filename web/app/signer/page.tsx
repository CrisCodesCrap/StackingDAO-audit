// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { Container } from '../components/Container';
import { useSTXAddress } from '../common/use-stx-address';
import { callReadOnlyFunction, cvToJSON, uintCV, stringAsciiCV, tupleCV, bufferCV } from '@stacks/transactions';
import { stacksNetwork } from '../common/utils';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '../components/AppContext/AppContext';
import { openStructuredDataSignatureRequestPopup } from '@stacks/connect';
import { pox4SignatureMessage, poxAddressToBtcAddress } from '@stacks/stacking';
import { makeContractCall } from '../common/contract-call';
import { WalletConnectButton } from '../components/WalletConnectButton';

export default function Points() {
  const { stackingCycle, setCurrentTxId, setCurrentTxStatus } = useAppContext();

  const stxAddress = useSTXAddress();

  const searchParams = useSearchParams();
  const pool = searchParams.get('pool');

  const [isLoading, setIsLoading] = useState(true);
  const [cycleSignerInfo, setCycleSignerInfo] = useState<any[]>([]);

  const generateSignature = async (cycle: number, topic: string) => {
    // Get PoX reward address from contract
    const callResultAddress = await callReadOnlyFunction({
      contractAddress: pool!.split(".")[0],
      contractName: pool!.split(".")[1],
      functionName: 'get-pox-reward-address',
      functionArgs: [],
      senderAddress: stxAddress!,
      network: stacksNetwork,
    });

    // Bitcoin address from PoX reward address
    const bitcoinAddress = poxAddressToBtcAddress(callResultAddress, "mainnet");
    console.log("Bitcoin address", bitcoinAddress);

    // Create signature message
    const signatureMessageInfo = {
      topic: topic,
      period: 1,
      network: stacksNetwork,
      rewardCycle: cycle,
      poxAddress: bitcoinAddress,
      maxAmount: "999999999000000000000",
      authId: Math.floor(Math.random() * 999999),
    }
    const { message, domain } = pox4SignatureMessage(signatureMessageInfo);
    console.log("Signature message values", signatureMessageInfo);

    // Sign message
    await openStructuredDataSignatureRequestPopup({
      domain,
      message,
      onFinish: async (data: any) => {
        console.log("Signature:", data);
        await broadcastTransaction(callResultAddress, signatureMessageInfo, data);
      },
    });
  };

  const broadcastTransaction = async (poxRewardAddress: tupleCV, signatureMessageInfo: any, sigData: any) => {
    await makeContractCall(
      {
        stxAddress: stxAddress!,
        contractAddress: pool.split(".")[0],
        contractName: pool.split(".")[1],
        functionName: 'set-cycle-signer-info',
        functionArgs: [
          uintCV(signatureMessageInfo.rewardCycle),
          stringAsciiCV(signatureMessageInfo.topic),
          poxRewardAddress,
          uintCV(signatureMessageInfo.maxAmount),
          uintCV(signatureMessageInfo.authId),
          bufferCV(Buffer.from(sigData.publicKey, "hex")),
          bufferCV(Buffer.from(sigData.signature, "hex")),
        ],
        postConditionMode: 0x01,
        network: stacksNetwork,
      },
      async (error?, txId?) => {
        setCurrentTxId(txId);
        setCurrentTxStatus('pending');
      }
    );
  }

  const fetchCycleSignerInfo = async (cycle: number) => {
    const callResultCommit = await callReadOnlyFunction({
      contractAddress: pool!.split(".")[0],
      contractName: pool!.split(".")[1],
      functionName: 'get-cycle-signer-info',
      functionArgs: [
        uintCV(cycle),
        stringAsciiCV("agg-commit")
      ],
      senderAddress: stxAddress!,
      network: stacksNetwork,
    });
    const callResultIncrease = await callReadOnlyFunction({
      contractAddress: pool!.split(".")[0],
      contractName: pool!.split(".")[1],
      functionName: 'get-cycle-signer-info',
      functionArgs: [
        uintCV(cycle),
        stringAsciiCV("agg-increase")
      ],
      senderAddress: stxAddress!,
      network: stacksNetwork,
    });

    return {
      "agg-commit": cvToJSON(callResultCommit).value,
      "agg-increase": cvToJSON(callResultIncrease).value
    }
  };

  const fetchSignerInfoData = async (stackingCycle: number, numberOfCycles: number) => {
    var signerInfoPromises: any[] = [];
    for (let cycle = stackingCycle+1; cycle < stackingCycle+numberOfCycles+1; cycle++) {
      signerInfoPromises.push(fetchCycleSignerInfo(cycle))
    }

    const signerInfoResults: any[] = await Promise.all(signerInfoPromises);

    console.log(signerInfoResults);
    var signerInfoData: any[] = []
    for (let cycle = stackingCycle+1; cycle < stackingCycle+numberOfCycles+1; cycle++) {
      const index = cycle - stackingCycle - 1;

      let signatureCommit;
      let signatureIncrease;
      if (signerInfoResults[index]) {
        if (signerInfoResults[index]['agg-commit']) {
          const fullSigCommit = signerInfoResults[index]['agg-commit'].value['signer-sig'].value;
          signatureCommit = fullSigCommit.slice(0, 10) + "..." + fullSigCommit.slice(-10)
        }
        if (signerInfoResults[index]['agg-increase']) {
          const fullSigIncrease = signerInfoResults[index]['agg-increase'].value['signer-sig'].value;
          signatureIncrease = fullSigIncrease.slice(0, 10) + "..." + fullSigIncrease.slice(-10)
        }
      }

      signerInfoData.push({
        cycle: cycle,
        signatureCommit: signatureCommit,
        signatureIncrease: signatureIncrease
      })
    }
    return signerInfoData;
  }

  const fetchData = async (stackingCycle: number) => {
    setIsLoading(true);

    const signerInfoData = await fetchSignerInfoData(stackingCycle, 5);
    setCycleSignerInfo(signerInfoData);

    setIsLoading(false);
  };

  useEffect(() => {
    if (stxAddress && pool && stackingCycle && stackingCycle != 0) {
      fetchData(Number(stackingCycle));
    }
  }, [stxAddress, stackingCycle]);

  return (
    <Container className="mt-12">
      <div className="mt-12 bg-white rounded-xl flex items-center justify-center shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
        <div className="flex flex-col w-full min-h-full">
          <div className="p-8 pb-0 md:p-12 md:pb-0">
            <div className="w-full mb-3 text-2xl font-headings">Signatures</div>
            <p className="text-sm text-gray-500">
              A list of provided signatures for <span className='font-bold'>{pool}</span>
            </p>
          </div>

          {!stxAddress ? (
            <div className="p-8 pb-12 md:p-12">
              <div className="w-full mb-3 text-2xl font-headings">Connect your wallet to get started</div>
              <WalletConnectButton />
            </div>
          ): !pool ? (
            <div className="p-8 pb-12 md:p-12">
              <div className="w-full mb-3 text-2xl font-headings">Missing pool address..</div>
            </div>
          ): (
            <div className="flow-root mt-8">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden border-t border-sd-gray-light rounded-b-xl">
                    <table className="min-w-full divide-y divide-sd-gray-light">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pr-3 text-left text-sm font-semibold text-sd-gray pl-10"
                          >
                            Reward Cycle
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-sd-gray"
                          >
                            Agg Commit Signature
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-sd-gray"
                          >
                            Agg Increase Signature
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-sd-gray"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {cycleSignerInfo.map(cycleSigner => (
                            <tr key={cycleSigner.cycle}>
                              <td className="text-sm font-medium text-gray-900 whitespace-nowrap pl-10">
                                {cycleSigner.cycle}
                              </td>
                              <td className="px-3 py-4 text-sm whitespace-nowrap">
                                {cycleSigner.signatureCommit ?? "No Commit Signature"}
                              </td>
                              <td className="px-3 py-4 text-sm whitespace-nowrap">
                                {cycleSigner.signatureIncrease ?? "No Increase Signature"}
                              </td>
                              <td className="px-3 py-4 text-sm whitespace-nowrap flex-col">
                                <button
                                  type="button"
                                  className="px-3 py-1 font-semibold text-white rounded-lg focus:outline-none bg-dark-green-600 active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50"
                                  onClick={() => generateSignature(cycleSigner.cycle, 'agg-commit')}
                                >
                                  Save Commit Signature
                                </button>

                                <button
                                  type="button"
                                  className="ml-3 px-3 py-1 font-semibold text-white rounded-lg focus:outline-none bg-dark-green-600 active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50"
                                  onClick={() => generateSignature(cycleSigner.cycle, 'agg-increase')}
                                >
                                  Save Increase Signature
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}



          
        </div>
      </div> 

    </Container>
  );
}
