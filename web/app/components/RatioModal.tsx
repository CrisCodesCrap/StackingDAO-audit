import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
  open: boolean | undefined;
  setOpen: (openState: boolean | undefined) => void;
}

export function RatioModal({ open, setOpen }: ModalProps) {
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
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
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
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 sm:w-full sm:max-w-lg sm:p-12">
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
                        d="M47.9998 30.6666L37.9998 40.6666L31.3332 34L22.6665 42.6666"
                        stroke="#7BF178"
                        strokeWidth="4"
                        strokeLinecap="square"
                      />
                      <path
                        d="M41.3335 29.3334H49.3335V37.3334"
                        stroke="#7BF178"
                        strokeWidth="4"
                        strokeLinecap="square"
                      />
                    </svg>

                    <Dialog.Title
                      as="h1"
                      className="mt-8 mb-4 text-2xl font-headings leading-6 text-sd-gray-darker"
                    >
                      stSTX goes up over time
                    </Dialog.Title>
                    <div className="mt-4">
                      <p className="text-sd-gray text-md">
                        Each PoX cycle, stSTX will be worth a little bit more relative to STX.
                        Multiplying this number with your stSTX position will give the approximate
                        amount of STX you receive when withdrawing.
                      </p>
                    </div>
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
