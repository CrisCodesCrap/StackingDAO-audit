// @ts-nocheck

import { Button } from '../components/Button';
import { Container } from '../components/Container';
import Link from 'next/link';

const statuses = {
  Launched: 'text-green-400 bg-green-400/10',
  'Not Launched Yet': 'text-rose-400 bg-rose-400/10',
};
const activityItems = [
  {
    user: {
      name: 'Arkadiko Finance',
      imageUrl: '/diko.svg',
    },
    commit: 'Use stSTX as collateral to mint USDA',
    status: 'Launched',
    link: 'https://arkadiko.finance/',
    actions: [
      {
        primary: true,
        name: 'Vault stSTX',
        url: 'https://app.arkadiko.finance/vaults',
      },
    ],
  },
  {
    user: {
      name: 'Bitflow AMM',
      imageUrl: '/bitflow-logo.png',
    },
    commit: 'stSTX/STX trading pool',
    status: 'Launched',
    link: 'https://www.bitflow.finance/',
    actions: [
      {
        name: 'Swap',
        url: 'https://app.bitflow.finance/trade',
      },
      {
        primary: true,
        name: 'Add liquidity',
        url: 'https://app.bitflow.finance/pool?tradingPair=stx-ststx',
      },
    ],
  },
  {
    user: {
      name: 'Velar',
      imageUrl: '/velar.png',
    },
    commit: 'stSTX/aeUSDC trading pool',
    status: 'Launched',
    link: 'https://app.velar.co/',
    actions: [
      {
        name: 'Swap',
        url: 'https://app.velar.co/swap',
      },
      {
        primary: true,
        name: 'Add liquidity',
        url: 'https://app.velar.co/pool',
      },
    ],
  },
  {
    user: {
      name: 'Zest Protocol',
      imageUrl: 'zest.svg',
    },
    commit: 'Use stSTX as collateral to borrow aeUSDC',
    status: 'Launched',
    link: 'https://www.zestprotocol.com/',
    actions: [
      {
        primary: true,
        name: 'Add stSTX',
        url: 'https://app.zestprotocol.com/',
      },
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Defi() {
  return (
    <Container className="mt-12">
      <div className="p-8 md:p-12 bg-white rounded-xl flex items-center shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
        <div className="flex flex-col w-full min-h-full">
          <h1 className="text-4xl font-headings">StackingDAO DeFi Integrations</h1>
          <p className="mt-4">
            As more integrations launch, they will be listed below with a brief explanation on how
            to use them.
          </p>

          <div className="flow-root mt-8">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="flow-root w-full text-left whitespace-nowrap">
                  <colgroup>
                    <col className="w-full sm:w-3/12" />
                    <col className="lg:w-3/12" />
                    <col className="lg:w-3/12" />
                    <col className="lg:w-3/12" />
                  </colgroup>
                  <tbody className="divide-y divide-white/5">
                    {activityItems.map(item => (
                      <tr key={item.commit}>
                        <td className="py-4 pl-4 pr-8 sm:pl-0">
                          <Link href={item.link} rel="noopener noreferrer" target="_blank">
                            <div className="flex items-center gap-x-2">
                              <img
                                src={item.user.imageUrl}
                                alt=""
                                className="w-8 h-8 bg-gray-800 rounded-full"
                              />
                              <div className="text-sm font-semibold leading-6 truncate text-neutral-800">
                                {item.user.name}
                              </div>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.25 2.25H15.75V6.75"
                                  stroke="#1C3830"
                                  stroke-width="1.5"
                                  stroke-linecap="square"
                                  stroke-linejoin="bevel"
                                />
                                <path
                                  d="M7.5 10.5L14.5 3.5"
                                  stroke="#1C3830"
                                  stroke-width="1.5"
                                  stroke-linecap="square"
                                  stroke-linejoin="bevel"
                                />
                                <path
                                  d="M13.5 9.75V14.25C13.5 14.6478 13.342 15.0294 13.0607 15.3107C12.7794 15.592 12.3978 15.75 12 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V6C2.25 5.60218 2.40804 5.22064 2.68934 4.93934C2.97064 4.65804 3.35218 4.5 3.75 4.5H8.25"
                                  stroke="#1C3830"
                                  stroke-width="1.5"
                                  stroke-linecap="square"
                                  stroke-linejoin="bevel"
                                />
                              </svg>
                            </div>
                          </Link>
                        </td>
                        <td className="hidden py-4 pl-0 pr-4 sm:table-cell">
                          <div className="flex gap-x-3">
                            <div className="text-sm font-normal leading-6 text-sd-gray-darker">
                              {item.commit}
                            </div>
                          </div>
                        </td>
                        <td className="hidden py-4 pl-0 pr-4 text-sm leading-6 sm:table-cell">
                          <div className="flex items-center md:justify-end gap-x-2 sm:justify-start">
                            <time className="text-gray-400 sm:hidden" dateTime={item.dateTime}>
                              {item.date}
                            </time>
                            <div
                              className={classNames(
                                statuses[item.status],
                                'flex-none rounded-full p-1'
                              )}
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-current" />
                            </div>
                            <div className="sm:block text-sd-gray-darker">{item.status}</div>
                          </div>
                        </td>
                        <td className="py-4 pl-0 pr-4 text-sm leading-6">
                          <div className="flex flex-col justify-end align-middle md:flex-row gap-y-2 md:gap-x-2">
                            {item.actions.map(value => (
                              <Button
                                key={value.name}
                                invert={!value.primary}
                                href={value.url}
                                target="_blank"
                              >
                                {value.name}
                              </Button>
                            ))}
                          </div>
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
  );
}
