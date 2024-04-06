import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
  open: boolean | undefined;
  setOpen: (openState: boolean | undefined) => void;
}

export function ApyModal({ open, setOpen }: ModalProps) {
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
                        d="M50 32.5195C50 35.6364 49.3292 38.0029 47.9876 39.619C46.6739 41.2063 44.7174 42 42.118 42C41 42 39.9239 41.8268 38.8897 41.4805C37.8835 41.1053 36.7655 40.4848 35.5357 39.619C34.5575 38.9264 33.7609 38.4502 33.146 38.1905C32.5311 37.9307 31.9022 37.8009 31.2593 37.8009C30.309 37.8009 29.5823 38.1183 29.0792 38.7532C28.604 39.3882 28.3665 40.2973 28.3665 41.4805H23C23 38.3636 23.6568 36.0115 24.9705 34.4242C26.3121 32.8081 28.2826 32 30.882 32C32 32 33.0621 32.1876 34.0683 32.5628C35.1025 32.9091 36.2345 33.5152 37.4643 34.381C38.4425 35.0736 39.2391 35.5498 39.854 35.8095C40.4689 36.0693 41.0978 36.1991 41.7407 36.1991C42.691 36.1991 43.4037 35.8817 43.8789 35.2468C44.382 34.6118 44.6335 33.7027 44.6335 32.5195H50Z"
                        fill="#7BF178"
                      />
                    </svg>

                    <Dialog.Title
                      as="h1"
                      className="mt-8 mb-4 text-2xl font-headings leading-6 text-sd-gray-darker"
                    >
                      Weighted average APY
                    </Dialog.Title>
                    <div className="mt-4">
                      <p className="text-sd-gray text-md">
                        The displayed APY represents an extrapolated yield based on the average
                        yield of the past 12 PoX stacking cycles
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
