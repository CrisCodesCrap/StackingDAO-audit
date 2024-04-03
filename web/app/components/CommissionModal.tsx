import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
  open: boolean | undefined;
  setOpen: (openState: boolean | undefined) => void;
}

export function CommissionModal({ open, setOpen }: ModalProps) {
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
                      <g clip-path="url(#clip0_542_3238)">
                        <path
                          d="M44 28L28 44"
                          stroke="#7BF178"
                          stroke-width="4"
                          stroke-linecap="square"
                        />
                        <path
                          d="M29.5 33C31.433 33 33 31.433 33 29.5C33 27.567 31.433 26 29.5 26C27.567 26 26 27.567 26 29.5C26 31.433 27.567 33 29.5 33Z"
                          stroke="#7BF178"
                          stroke-width="3"
                          stroke-linecap="square"
                        />
                        <path
                          d="M42.5 46C44.433 46 46 44.433 46 42.5C46 40.567 44.433 39 42.5 39C40.567 39 39 40.567 39 42.5C39 44.433 40.567 46 42.5 46Z"
                          stroke="#7BF178"
                          stroke-width="3"
                          stroke-linecap="square"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_542_3238">
                          <rect width="24" height="24" fill="white" transform="translate(24 24)" />
                        </clipPath>
                      </defs>
                    </svg>

                    <Dialog.Title
                      as="h1"
                      className="mt-8 mb-4 text-2xl font-headings leading-6 text-sd-gray-darker"
                    >
                      Performance fees
                    </Dialog.Title>
                    <div className="mt-4">
                      <p className="text-sd-gray text-md">
                        To make sure we can offer the highest quality product, keep yields optimal
                        and auto-compounding, the protocol charges a small 5% commission to keep the
                        lights on. Thank you!
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
