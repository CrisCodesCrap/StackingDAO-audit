import { Container } from '../components/Container'

const statuses = { 'Launched': 'text-green-400 bg-green-400/10', 'Not Launched Yet': 'text-rose-400 bg-rose-400/10' }
const activityItems = [
  {
    user: {
      name: 'Arkadiko Finance',
      imageUrl: '/diko.svg'
    },
    commit: 'Use stSTX as collateral to mint USDA',
    status: 'Not Launched Yet',
  },
  {
    user: {
      name: 'ALEX AMM',
      imageUrl: '/alex.png'
    },
    commit: 'STX/stSTX and STX/STDAO trading pools',
    status: 'Not Launched Yet',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Defi() {
  return (
    <Container className="mt-12">
      <div className="py-10">
        <div className="w-full text-center hidden md:block font-semibold text-4xl my-8">StackingDAO DeFi Integrations</div>

        <div className="bg-white shadow sm:rounded-lg mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Keep an eye on the integrations</h3>
            <div className="mt-2 text-sm text-stacks font-semibold">
              <p>
                As more integrations launch, they will be listed below with a brief explanation on how to use them.
              </p>
            </div>
          </div>
        </div>

        <table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-full sm:w-4/12" />
            <col className="lg:w-4/12" />
            <col className="lg:w-2/12" />
            <col className="lg:w-1/12" />
          </colgroup>
          <thead className="border-b border-white/10 text-sm leading-6 text-neutral-800">
            <tr>
              <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8" />
              <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell" />
              <th scope="col" className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8" />
              <th scope="col" className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activityItems.map((item) => (
              <tr key={item.commit}>
                <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                  <div className="flex items-center gap-x-4">
                    <img src={item.user.imageUrl} alt="" className="h-8 w-8 rounded-full bg-gray-800" />
                    <div className="truncate text-sm font-semibold leading-6 text-neutral-800">{item.user.name}</div>
                  </div>
                </td>
                <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                  <div className="flex gap-x-3">
                    <div className="font-normal text-sm leading-6">{item.commit}</div>
                  </div>
                </td>
                <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                  <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                    <time className="text-gray-400 sm:hidden" dateTime={item.dateTime}>
                      {item.date}
                    </time>
                    <div className={classNames(statuses[item.status], 'flex-none rounded-full p-1')}>
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>
                    <div className="hidden text-neutral-800 sm:block">{item.status}</div>
                  </div>
                </td>
                <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                  #
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  )
}
