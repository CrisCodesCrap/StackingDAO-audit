// @ts-nocheck

'use client';

import { Container } from '../components/Container';
import { useEffect, useState } from 'react';
import { callReadOnlyFunction } from '@stacks/transactions';
import { asyncForEach, stacksNetwork, currency } from '../common/utils';

import Link from 'next/link';
import { PieChart } from '../components/PieChart';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { PlaceholderBar } from '../components/PlaceholderBar';

export default function Analytics() {
  const [totalStx, setTotalStx] = useState<number>(0);
  const [stackingStx, setStackingStx] = useState<number>(0);
  const [idleStx, setIdleStx] = useState<number>(0);

  const signers = [
    {
      name: 'ALUM Labs',
      address: 'SP1C9GMWB96JGF8EPDN6BR4EYWBVBX77KFPBVW72W', // signer address
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-signer-alum-labs-v1`,
      url: 'https://alumlabs.io/',
    },
    {
      name: 'Blockdaemon',
      address: 'SPTY3CVEZGHBRR3XQ4QS206B13HMEFB04NQ62NMS',
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-signer-blockdaemon-v1`,
      url: 'https://blockdaemon.com/',
    },
    {
      name: 'Chorus One',
      address: 'SP19XSSA0KBMJEV9YE2J2A8VBNP7BWX3DEQPJCQ1V',
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-signer-chorus-one-v1`,
      url: 'https://chorus.one/',
    },
    {
      name: 'DeSpread',
      address: 'SPKTP50NFJVXCFRZ8ZHY7MGF3Z3AAM9RZBNKPM6A',
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-signer-despread-v1`,
      url: 'https://despread.io/',
    },
    {
      name: 'Kiln',
      address: 'SP39DSWRVSCSJFNVVT6HXEKS17ZC9Y9VXVWH328M7',
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-signer-kiln-v1`,
      url: 'https://kiln.fi/',
    },
    {
      name: 'Luganodes',
      address: 'SP10ZWZTN6MZ1R0XW9P7J4S18WQYE61CX5E1N7VRN',
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-signer-luganodes-v1`,
      url: 'https://www.luganodes.com/',
    },
    {
      name: 'Restake',
      address: 'SPVH2V0XQ7WGHPNZ5NNNMWFXXFSZEYEJ2ECG7NM8',
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-signer-restake-v1`,
      url: 'https://restake.net/',
    },
    {
      name: 'Stacking DAO',
      address: 'SP2JMM827KCXPB931MGKVJ5GVF3K4VDCBMW5CJ0ES',
      contract: `${process.env.NEXT_PUBLIC_STSTX_ADDRESS}.stacking-pool-v1`,
      url: 'https://www.stackingdao.com/',
    },
  ];
  const [signerInfo, setSignerInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startedLoading, setStartedLoading] = useState(false);

  useEffect(() => {
    const fetchTotal = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'reserve-v1',
        functionName: 'get-total-stx',
        functionArgs: [],
        senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        network: stacksNetwork,
      });

      setTotalStx(Number(result?.value?.value) / 1000000);
    };

    const fetchStxStacking = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'reserve-v1',
        functionName: 'get-stx-stacking',
        functionArgs: [],
        senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        network: stacksNetwork,
      });

      setStackingStx(Number(result?.value?.value) / 1000000);
    };

    const fetchStxIdle = async () => {
      const result = await callReadOnlyFunction({
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        contractName: 'reserve-v1',
        functionName: 'get-stx-balance',
        functionArgs: [],
        senderAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
        network: stacksNetwork,
      });

      setIdleStx(Number(result?.value?.value) / 1000000);
    };

    if (startedLoading) return;
    setStartedLoading(true);
    fetchTotal();
    fetchStxStacking();
    fetchStxIdle();
  }, []);

  useEffect(() => {
    if (totalStx < 100) return;

    const fetchSignerInfo = async () => {
      const allInfo = [];
      await asyncForEach(signers, async signer => {
        const url = `https://api.mainnet.hiro.so/extended/v1/pox4/${signer['contract']}/delegations`;
        const response = await fetch(url, { credentials: 'omit' });
        const data = await response.json();

        const sumWithInitial = Object.values(data['results']).reduce(
          (accumulator, currentValue) => accumulator + Number(currentValue['amount_ustx']),
          0
        );

        allInfo.push({
          name: signer['name'],
          address: signer['address'],
          contract: signer['contract'],
          url: signer['url'],
          amount: sumWithInitial / 1000000.0,
          percentage: parseFloat((100.0 * sumWithInitial) / 1000000.0 / totalStx),
        });
      });

      setSignerInfo(allInfo);
      setIsLoading(false);
    };

    setIsLoading(true);
    fetchSignerInfo();
  }, [totalStx]);

  return (
    <Container className="mt-12">
      <div className="p-8 md:p-12 bg-white rounded-xl flex items-center shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
        <div className="flex flex-col w-full min-h-full">
          <h1 className="text-4xl font-headings">StackingDAO Analytics</h1>
          <p className="mt-4">
            Insights about signers distribution of the total amount of stacked STX.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-9 lg:grid-cols-2 mt-9">
        <div className="bg-white rounded-xl flex items-center shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
          <div className="flex flex-col w-full min-h-full">
            <div className="p-8 md:p-12">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="p-6 rounded-lg bg-sd-gray-light col-span-2">
                  <dt className="text-sm font-medium leading-6 text-sd-gray">Total</dt>
                  <dd className="flex-none w-full text-base font-semibold leading-6 sm:text-2xl text-sd-gray-darker">
                    {currency.rounded.format(totalStx)} <span className="text-xs">STX</span>
                  </dd>
                </div>
                <div className="p-6 rounded-lg bg-sd-gray-light">
                  <dt className="text-sm font-medium leading-6 text-sd-gray">Stacked </dt>
                  <dd className="flex-none w-full text-base font-semibold leading-6 sm:text-2xl text-sd-gray-darker">
                    {currency.rounded.format(stackingStx)} <span className="text-xs">STX</span>
                  </dd>
                </div>
                <div className="p-6 rounded-lg bg-sd-gray-light">
                  <dt className="text-sm font-medium leading-6 text-sd-gray">Idle</dt>
                  <dd className="flex-none w-full text-base font-semibold leading-6 sm:text-2xl text-sd-gray-darker">
                    {currency.rounded.format(idleStx)} <span className="text-xs">STX</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flow-root">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden border-t border-sd-gray-light rounded-b-xl">
                    <table className="min-w-full divide-y divide-sd-gray-light">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-sd-gray sm:pl-10"
                          >
                            Signer
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-sd-gray"
                          >
                            Address
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-sd-gray"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-sd-gray"
                          >
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {isLoading && (
                          <>
                            <tr>
                              <td className="pl-6 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-10">
                                <PlaceholderBar
                                  className="inline-flex w-12 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-10 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-8 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-6 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="pl-6 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-10">
                                <PlaceholderBar
                                  className="inline-flex w-12 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-10 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-8 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-6 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="pl-6 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-10">
                                <PlaceholderBar
                                  className="inline-flex w-12 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-10 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-8 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-6 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="pl-6 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-10">
                                <PlaceholderBar
                                  className="inline-flex w-12 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-10 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-8 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <PlaceholderBar
                                  className="inline-flex w-6 h-2"
                                  color={PlaceholderBar.color.GRAY}
                                />
                              </td>
                            </tr>
                          </>
                        )}
                        {signerInfo.map(info => (
                          <tr key={info['address']}>
                            <td className="pl-6 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-10">
                              <a href={info['url']} target="_blank">
                                {info['name']}
                              </a>
                            </td>
                            <td className="px-3 py-4 text-sm whitespace-nowrap">
                              <Link
                                href={`https://explorer.hiro.so/address/${info['contract']}?chain=mainnet`}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <div className="flex font-normal text-gray-500">
                                  <span className="">
                                    {`${info['contract']}`.slice(0, 4)}...
                                    {`${info['contract']}`.slice(-12)}
                                  </span>
                                  <div className="pt-1 pl-2">
                                    <ExternalLinkIcon className="w-3 h-3 opacity-80" />
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {currency.rounded.format(info['amount'])} STX
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {currency.short.format(info['percentage'])}%
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
        </div>
        <div>
          <div className="p-8 md:p-12 bg-dark-green-600 rounded-xl shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
            <h2 className="text-2xl text-white font-headings mb-6">Signers Distribution Chart</h2>
            {isLoading ? (
              <div className="bg-gradient-to-br from-white/80 via-white/20 to-white/30 border-2 border-white w-[400px] h-[400px] mx-auto rounded-full" />
            ) : (
              <PieChart signerInfo={signerInfo} />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
