// @ts-nocheck

import React, { Fragment, useContext, useState } from 'react';
import { useAppContext } from './AppContext';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';
import { getExplorerLink } from '../common/utils';

export const TxStatus = () => {
  const { currentTxStatus, currentTxId, setCurrentTxId, currentTxMessage } = useAppContext();

  const explorerLink = getExplorerLink(currentTxId);

  const statusClass = () => {
    if (currentTxStatus === 'success') {
      return 'text-green-500';
    } else if (currentTxStatus === 'pending') {
      return 'text-gray-500';
    }

    return 'text-red-500';
  };

  const hidePopup = () => {
    setCurrentTxId('');
  };

  return (
    <>
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 mt-24 pointer-events-none sm:p-6 sm:items-start z-[100]">
        <div className="flex flex-col items-center w-full space-y-4 sm:items-end">
          {currentTxId ? (
            <Transition
              show={currentTxId && currentTxId != ''}
              as={Fragment}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <div className="flex items-start">

                    <div className="flex-shrink-0">
                      <CheckCircleIcon className={`w-6 h-6 ${statusClass()}`} aria-hidden="true" />
                    </div>

                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-gray-900">
                        Transaction broadcasted
                      </p>

                      <div className="my-4">
                        <a className="text-sm font-medium text-green-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2" href={explorerLink} target="_blank">
                          View in explorer
                        </a>
                      </div>

                      {currentTxMessage ? (
                        <p className={`mt-1 text-sm ${statusClass()}`}>
                          {currentTxMessage}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">
                          Your transaction has been broadcasted. It can take up to 30 minutes before it completes.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 ml-4">
                      <button
                        className="inline-flex text-gray-400 bg-white rounded-md cursor-pointer hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {hidePopup()}}>
                        <span className="sr-only">Close</span>
                        <XIcon className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          ) : null }
          </div>
      </div>
    </>
  );
};
