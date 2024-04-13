// @ts-nocheck

import React, { Fragment, useRef, useState } from 'react';
import { useAppContext } from './AppContext/AppContext';
import { Dialog, Transition } from '@headlessui/react';
import { getExplorerLink } from '../common/utils';

export const TxStatus = () => {
  const { currentTxId, setCurrentTxId } = useAppContext();
  const explorerLink = getExplorerLink(currentTxId);
  const cancelButtonRef = useRef(null);

  const hidePopup = () => {
    setCurrentTxId('');
  };

  const viewExplorer = () => {
    window.open(explorerLink, '_blank', 'noreferrer');
    setCurrentTxId('');
  };

  return (
    <>
      <Transition.Root show={currentTxId != ''} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={hidePopup}
        >
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
                <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 sm:w-full sm:max-w-xl sm:p-12">
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
                          d="M44 30L33 41L28 36"
                          stroke="#7BF178"
                          strokeWidth="4"
                          strokeLinecap="square"
                        />
                      </svg>

                      <Dialog.Title
                        as="h1"
                        className="mt-8 mb-4 text-2xl font-headings leading-6 text-sd-gray-darker"
                      >
                        Transaction broadcast
                      </Dialog.Title>
                      <div className="mt-4">
                        <p className="text-sd-gray text-md">
                          This transaction takes at least 1 Stacks block to confirm. That&apos;s
                          approximately around 10-30 minutes.
                        </p>

                        <p className="mt-2 text-sd-gray text-md">
                          Please note that even after the transaction is mined, it might take a few
                          minutes before this is propagated to the Stacks APIs and shown on this
                          website.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full px-6 py-2 text-lg font-semibold text-white border-2 border-transparent rounded-lg focus:outline-none bg-dark-green-600 border-dark-green-600 active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 sm:col-start-2"
                      onClick={() => viewExplorer()}
                    >
                      View in explorer
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full px-6 py-2 text-lg font-semibold bg-white border-2 rounded-lg focus:outline-none text-dark-green-600 border-dark-green-600 active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50 sm:col-start-1 sm:mt-0"
                      onClick={() => hidePopup()}
                      ref={cancelButtonRef}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
