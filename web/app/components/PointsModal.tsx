import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
  open: boolean | undefined;
  setOpen: (openState: boolean | undefined) => void;
}

export function PointsModal({ open, setOpen }: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-sd-gray bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 sm:w-full sm:max-w-3xl sm:p-12">
                <div>
                  <div className="text-center">
                    <svg
                      className="mx-auto"
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="36" cy="36" r="36" fill="#1D3730" />
                      <path
                        d="M28.0003 24H44.0003L49.3337 32L36.0003 49.3333L22.667 32L28.0003 24Z"
                        stroke="#7BF178"
                        stroke-width="3"
                        stroke-linecap="square"
                      />
                      <path
                        d="M34.667 25L30.667 32L36.0003 45.3333L41.3337 32L37.3337 25"
                        stroke="#7BF178"
                        stroke-width="3"
                        stroke-linecap="square"
                      />
                      <path
                        d="M23.667 32H48.3337"
                        stroke="#7BF178"
                        stroke-width="3"
                        stroke-linecap="square"
                      />
                    </svg>

                    <Dialog.Title
                      as="h1"
                      className="mt-8 mb-4 text-2xl font-headings leading-6 text-sd-gray-darker"
                    >
                      How to earn points
                    </Dialog.Title>
                  </div>
                  <div className="mt-8">
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-full bg-dark-green-600 text-fluor-green-500 shrink-0">
                        1
                      </div>
                      <h2 className="text-lg font-semibold">Holding stSTX</h2>
                    </div>
                    <p className="mt-4 text-sm text-sd-gray">
                      For those of you holding onto stSTX, your faith in the ecosystem will be
                      rewarded. Every stSTX in your wallet accumulates 1 point per day. The points
                      will be calculated based on a daily snapshot of your stSTX holdings. For
                      example, holding 1000 stSTX will earn you 1000 points each day, and the longer
                      you hold, the more you accumulate.
                    </p>

                    <div className="flex gap-2 mt-6">
                      <div className="flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-full bg-dark-green-600 text-fluor-green-500 shrink-0">
                        2
                      </div>
                      <h2 className="text-lg font-semibold">DeFi Activities with stSTX</h2>
                    </div>
                    <p className="mt-4 text-sm text-sd-gray">
                      If you&apos;re an active participant in the DeFi world, your engagement will
                      also earn you extra points. For those lending your stSTX you will collect 1.5
                      points per stSTX per day. You can earn 2.5 points for stSTX/STX LPs. We are
                      only tracking DeFi platforms with an aggregate TVL that is greater than a
                      minimum threshold that ensures meaningful liquidity on the platform. As such
                      we are currently tracking Arkadiko, Bitflow, Velar and Zest.
                    </p>
                    <p className="mt-2 text-sm text-sd-gray">
                      Please reach out to us if you believe we should add a protocol that is missing
                      from our list.
                    </p>

                    <div className="flex gap-2 mt-6">
                      <div className="flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-full bg-dark-green-600 text-fluor-green-500 shrink-0">
                        3
                      </div>
                      <h2 className="text-lg font-semibold">Referrals</h2>
                    </div>
                    <p className="mt-4 text-sm text-sd-gray">
                      For our community builders out there, we haven’t forgotten you. Refer a friend
                      to join the StackingDAO ecosystem, and you&apos;ll gain 10% of the points they
                      earn. For example, if your referee earns 1000 points, you get 100 points.
                    </p>

                    <div className="flex gap-2 mt-6">
                      <div className="flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-full bg-dark-green-600 text-fluor-green-500 shrink-0">
                        4
                      </div>
                      <h2 className="text-lg font-semibold">OG and Genesis NFTs</h2>
                    </div>
                    <p className="mt-4 text-sm text-sd-gray">
                      For holders of OG and Genesis NFTs, we have a special points multiplier in
                      store. Have you accumulated a lot of points? Congrats, you will get even more
                      points!
                    </p>
                  </div>
                </div>
                <div className="mt-5 sm:mt-8">
                  <button
                    type="button"
                    className="flex items-center justify-center w-full gap-2 px-6 py-3 text-lg font-semibold text-white rounded-lg focus:outline-none bg-dark-green-600 active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50"
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
  );
}
