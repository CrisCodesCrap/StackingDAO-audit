import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface ModalProps {
  open: boolean | undefined;
  setOpen: (openState: boolean | undefined) => void;
}

export function PointsModal({ open, setOpen }: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 max-w-5xl sm:p-6">
                <div>
                  <Dialog.Title as="h1" className="font-semibold leading-6 text-2xl text-gray-900 mb-4 mt-2">
                    Points are live
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-md text-gray-500 mb-2">
                      StackingDAO Points are designed to quantify and reward your contributions to the ever-growing StackingDAO ecosystem.
                    </p>
                    <p className="text-md text-gray-500 mb-2">
                      You can earn points through holding stSTX, participating in DeFi activities or making referrals, and more.
                      The math is simple, transparent, and designed to benefit everyone from long-term holders to active DeFi users.
                    </p>

                    <h2 className="text-lg">How to Earn Points</h2>
                    <h2 className="text-md mt-2">Holding stSTX</h2>
                    <p className="text-md text-gray-500 mb-2">
                      For those of you holding onto stSTX, your faith in the ecosystem will be rewarded. Every stSTX in your wallet accumulates 1 point per day.
                      The points will be calculated based on a daily snapshot of your stSTX holdings.

                      For example, holding 1000 stSTX will earn you 1000 points each day, and the longer you hold, the more you accumulate.
                    </p>

                    <h2 className="text-md mt-2">DeFi Activities with stSTX</h2>
                    <p className="text-md text-gray-500 mb-2">
                      If you're an active participant in the DeFi world, your engagement will also earn you extra points. For those lending your stSTX you will collect 1.5 points per stSTX per day. You can earn 2.5 points for stSTX/STX LPs.

                      We are only tracking DeFi platforms with an aggregate TVL that is greater than a minimum threshold that ensures meaningful liquidity on the platform.
                      As such we are currently tracking ALEX, Arkadiko and Bitflow
                    </p>
                    <p className="text-md text-gray-500 mb-2">
                      Please reach out to us if you believe we should add a protocol that is missing from our list.
                    </p>

                    <h2 className="text-md mt-2">Referrals</h2>
                    <p className="text-md text-gray-500 mb-2">
                      For our community builders out there, we haven’t forgotten you. Refer a friend to join the StackingDAO ecosystem, and you'll gain 10% of the points they earn.

                      For example, if your referee earns 1000 points, you get 100 points.
                    </p>

                    <h2 className="text-md mt-2">OG and Genesis NFTs</h2>
                    <p className="text-md text-gray-500 mb-2">
                      For holders of OG and Genesis NFTs, we have a special points multiplier in store. Have you accumulated a lot of points? Congrats, you will get even more points!
                    </p>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg bg-ststx text-white active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 w-full"
                    onClick={() => setOpen(false)}
                  >
                    Got it
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
