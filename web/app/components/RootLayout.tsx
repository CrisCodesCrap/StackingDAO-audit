// @ts-nocheck

'use client';

import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { WalletConnectButton } from './WalletConnectButton';
import { Container } from './Container';
import { Footer } from './Footer';
import { GridPattern } from './GridPattern';

import { MenuIcon, XIcon } from '@heroicons/react/outline';
import StxLogo from './Logos/Stx';

const RootLayoutContext = createContext({});

function Header({ panelId, invert = false, expanded, onToggle, toggleRef, signOut }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  return (
    <Container>
      <header>
        <nav className="flex items-center justify-between mx-auto max-w-7xl" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5 flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="219" height="40" fill="none">
                <path
                  fill="#1D3730"
                  d="M68.8439 24.7675c0-.528-.2144-.9485-.6417-1.2601-.4289-.3117-1.1336-.5401-2.1172-.6838l-3.0213-.4553c-2.3151-.3676-3.9959-.9682-5.0425-1.8002-1.0466-.832-1.5699-1.9832-1.5699-3.4551 0-1.6156.7257-2.8711 2.1757-3.7682 1.4514-.8955 3.4531-1.3433 6.0066-1.3433 2.363 0 4.1908.3994 5.4833 1.1996 1.2925.8002 2.1202 2.0392 2.486 3.7198l-3.9959.4554c-.3014-.8003-.7692-1.3751-1.4034-1.7276-.6343-.3509-1.5309-.5279-2.6885-.5279-1.2535 0-2.2206.1603-2.9013.4795-.6823.3207-1.0226.7836-1.0226 1.3917 0 .5446.2024.9515.6072 1.2238.4049.2723 1.1381.4886 2.1997.6475l3.5686.5763c2.1246.3358 3.6705.9198 4.6376 1.7518.9671.832 1.4514 1.9922 1.4514 3.4792 0 1.7276-.7062 3.0482-2.1171 3.9604-1.411.9122-3.4651 1.3675-6.1611 1.3675-5.4548 0-8.3817-1.9363-8.7775-5.8074h4.1863c.174.9122.6388 1.5884 1.3915 2.0286.7527.4402 1.8278.6595 3.2237.6595 1.3165 0 2.3196-.18 3.0093-.54.6897-.36 1.0346-.8834 1.0346-1.5717h-.0015ZM80.7834 15.9119h-6.5419v-3.4792h17.2687v3.4792h-6.5419v13.6555h-4.1864V15.9119h.0015ZM93.7953 29.5658h-4.3047l7.6589-17.1347h4.8045l7.659 17.1347h-4.425l-1.57-3.6471h-8.3247l-1.498 3.6471Zm5.6858-13.7507-2.8789 6.8875h5.7798l-2.9009-6.8875ZM109.923 20.9992c0-1.7441.372-3.2917 1.119-4.644.745-1.3524 1.832-2.4159 3.258-3.1919 1.427-.776 3.164-1.1633 5.209-1.1633 4.757 0 7.644 1.9832 8.657 5.9511l-4.138.4795c-.364-1.0392-.904-1.7911-1.618-2.2555-.714-.4644-1.681-.6958-2.901-.6958-1.633 0-2.914.4795-3.842 1.4401-.928.9606-1.391 2.3205-1.391 4.0798 0 1.7593.463 3.1193 1.391 4.0799.928.9606 2.231 1.4401 3.914 1.4401 2.648 0 4.203-1.0241 4.661-3.0724h4.211c-.239 2.08-1.138 3.6926-2.701 4.8362-1.562 1.1437-3.643 1.7155-6.243 1.7155-2.062 0-3.806-.3797-5.233-1.1406-1.428-.7609-2.51-1.8153-3.246-3.1677-.738-1.3524-1.107-2.915-1.107-4.691ZM131.472 12.4327h4.187v7.2959l8.111-7.2959h4.853l-7.184 6.5516 7.873 10.5831h-4.852l-5.922-7.9918-2.879 2.4718v5.52h-4.187V12.4327ZM152.167 12.4327h4.187v17.1347h-4.187V12.4327ZM160.778 12.4327h3.782l9.443 11.4468V12.4327h3.996v17.1347h-3.782l-9.443-11.4711v11.4711h-3.996V12.4327ZM181.424 21.0719c0-1.9363.412-3.5761 1.237-4.9195.825-1.3433 1.975-2.3719 3.449-3.0844 1.475-.711 3.178-1.068 5.114-1.068 2.41 0 4.309.5007 5.696 1.4991 1.387.9999 2.303 2.2918 2.747 3.8756l-4.186.4554c-.318-.8472-.829-1.4674-1.534-1.8592-.706-.3918-1.645-.5884-2.819-.5884-1.777 0-3.125.4916-4.044 1.4764-.919.9833-1.379 2.3644-1.379 4.1403 0 3.7441 1.989 5.6153 5.97 5.6153 1.761 0 3.244-.2647 4.449-.7912v-2.6397h-4.449v-3.1192H200v7.5833c-1.095.7518-2.356 1.3312-3.781 1.7396-1.426.4085-2.935.6127-4.52.6127-2.156 0-4-.3525-5.53-1.0559-1.53-.7034-2.703-1.7245-3.52-3.0602-.817-1.3358-1.225-2.9393-1.225-4.812ZM202 12.1186h2.093c.894 0 1.578.2041 2.053.6139.474.4098.71.9982.71 1.7667 0 .7686-.253 1.3525-.758 1.7638-.506.4113-1.226.6169-2.16.6169H202v-4.7613Zm4.008 2.3806c0-1.1287-.637-1.6931-1.91-1.6931h-1.281v3.3878h1.145c.673 0 1.182-.1426 1.528-.4263.346-.2837.518-.707.518-1.2669v-.0015ZM207.452 16.8799l2.297-4.7613h.887l2.296 4.7613h-.893l-.583-1.2263h-2.573l-.569 1.2263h-.862Zm2.722-3.9883-.996 2.1135h1.992l-.996-2.1135ZM213.52 14.4993c0-.5104.113-.9532.339-1.327.225-.3737.544-.6619.954-.8661.41-.2041.894-.3062 1.45-.3062.557 0 1.045.1021 1.453.3062.409.2042.724.4939.949.8661.224.3738.335.8151.335 1.327 0 .5118-.113.9486-.338 1.3239-.226.3752-.543.6664-.952.8706-.409.2041-.893.3062-1.453.3062-.559 0-1.038-.1021-1.45-.3062-.412-.2042-.729-.4939-.951-.8661-.224-.3738-.336-.8151-.336-1.3269v-.0015Zm.853 0c0 .5688.166 1.0132.497 1.3299.332.3182.796.4773 1.392.4773.596 0 1.053-.1606 1.384-.4803.332-.3197.497-.7626.497-1.3269 0-.5644-.165-1.0118-.494-1.33-.329-.3182-.793-.4773-1.389-.4773s-1.055.1591-1.389.4773c-.334.3182-.501.7611-.501 1.33h.003ZM36.914 0H3.08599C1.38164 0 0 1.38164 0 3.08599V36.914C0 38.6184 1.38164 40 3.08599 40H36.914C38.6184 40 40 38.6184 40 36.914V3.08599C40 1.38164 38.6184 0 36.914 0Z"
                />
                <path
                  fill="#7BF178"
                  d="m31.2456 14.5801-1.0948-.8538c-1.2729-.993-2.8413-1.5308-4.4545-1.5308H10.9599V6.00003h14.735c2.9918 0 5.8983.99876 8.2588 2.83827l1.0933.85235-3.8014 4.88795v.0015ZM23.0029 33.9986h-9.6505c-2.9919 0-5.89831-.9988-8.2588-2.8383l-1.09336-.8523 3.80141-4.888 1.09481.8523c1.27434.993 2.84274 1.5322 4.45744 1.5322h9.6505V34l-.0015-.0014ZM25.1087 16.9038h-9.4464c-2.5936 0-4.7036-2.1121-4.7036-4.7083H4.76932c0 6.0114 4.88607 10.9023 10.89158 10.9023h9.4463c2.5937 0 4.7036 2.112 4.7036 4.7082h6.1894c0-6.0114-4.886-10.9022-10.8915-10.9022Z"
                />
              </svg>
            </a>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <Popover.Group className="hidden mt-2 lg:flex lg:gap-x-12">
            <Link
              className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                pathname === '/' || pathname === '/stack' || pathname === '/unstack'
                  ? 'text-dark-green-600'
                  : 'text-gray-500'
              }`}
              href="/"
            >
              {pathname === '/' || pathname === '/stack' || pathname === '/unstack' ? (
                <svg
                  className="w-2 h-2 text-fluor-green-500"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
                </svg>
              ) : null}
              Stacking
            </Link>

            <Link
              className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                pathname === '/points' ? 'text-dark-green-600' : 'text-gray-500'
              }`}
              href="/points"
            >
              {pathname === '/points' ? (
                <svg
                  className="w-2 h-2 text-fluor-green-500"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
                </svg>
              ) : null}
              <div className="text-base">Points</div>
            </Link>

            <Link
              className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                pathname === '/defi' ? 'text-dark-green-600' : 'text-gray-500'
              }`}
              href="/defi"
            >
              {pathname === '/defi' ? (
                <svg
                  className="w-2 h-2 text-fluor-green-500"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
                </svg>
              ) : null}
              <div className="text-base">DeFi</div>
            </Link>

            <Link
              className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                pathname === '/analytics' ? 'text-dark-green-600' : 'text-gray-500'
              }`}
              href="/analytics"
            >
              {pathname === '/analytics' ? (
                <svg
                  className="w-2 h-2 text-fluor-green-500"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
                </svg>
              ) : null}
              <div className="text-base">Analytics</div>
            </Link>
          </Popover.Group>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <WalletConnectButton signOut={signOut} />
          </div>
        </nav>

        <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-30 w-full px-6 py-6 overflow-y-auto bg-white sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="/">
                <svg xmlns="http://www.w3.org/2000/svg" width="219" height="40" fill="none">
                  <path
                    fill="#1D3730"
                    d="M68.8439 24.7675c0-.528-.2144-.9485-.6417-1.2601-.4289-.3117-1.1336-.5401-2.1172-.6838l-3.0213-.4553c-2.3151-.3676-3.9959-.9682-5.0425-1.8002-1.0466-.832-1.5699-1.9832-1.5699-3.4551 0-1.6156.7257-2.8711 2.1757-3.7682 1.4514-.8955 3.4531-1.3433 6.0066-1.3433 2.363 0 4.1908.3994 5.4833 1.1996 1.2925.8002 2.1202 2.0392 2.486 3.7198l-3.9959.4554c-.3014-.8003-.7692-1.3751-1.4034-1.7276-.6343-.3509-1.5309-.5279-2.6885-.5279-1.2535 0-2.2206.1603-2.9013.4795-.6823.3207-1.0226.7836-1.0226 1.3917 0 .5446.2024.9515.6072 1.2238.4049.2723 1.1381.4886 2.1997.6475l3.5686.5763c2.1246.3358 3.6705.9198 4.6376 1.7518.9671.832 1.4514 1.9922 1.4514 3.4792 0 1.7276-.7062 3.0482-2.1171 3.9604-1.411.9122-3.4651 1.3675-6.1611 1.3675-5.4548 0-8.3817-1.9363-8.7775-5.8074h4.1863c.174.9122.6388 1.5884 1.3915 2.0286.7527.4402 1.8278.6595 3.2237.6595 1.3165 0 2.3196-.18 3.0093-.54.6897-.36 1.0346-.8834 1.0346-1.5717h-.0015ZM80.7834 15.9119h-6.5419v-3.4792h17.2687v3.4792h-6.5419v13.6555h-4.1864V15.9119h.0015ZM93.7953 29.5658h-4.3047l7.6589-17.1347h4.8045l7.659 17.1347h-4.425l-1.57-3.6471h-8.3247l-1.498 3.6471Zm5.6858-13.7507-2.8789 6.8875h5.7798l-2.9009-6.8875ZM109.923 20.9992c0-1.7441.372-3.2917 1.119-4.644.745-1.3524 1.832-2.4159 3.258-3.1919 1.427-.776 3.164-1.1633 5.209-1.1633 4.757 0 7.644 1.9832 8.657 5.9511l-4.138.4795c-.364-1.0392-.904-1.7911-1.618-2.2555-.714-.4644-1.681-.6958-2.901-.6958-1.633 0-2.914.4795-3.842 1.4401-.928.9606-1.391 2.3205-1.391 4.0798 0 1.7593.463 3.1193 1.391 4.0799.928.9606 2.231 1.4401 3.914 1.4401 2.648 0 4.203-1.0241 4.661-3.0724h4.211c-.239 2.08-1.138 3.6926-2.701 4.8362-1.562 1.1437-3.643 1.7155-6.243 1.7155-2.062 0-3.806-.3797-5.233-1.1406-1.428-.7609-2.51-1.8153-3.246-3.1677-.738-1.3524-1.107-2.915-1.107-4.691ZM131.472 12.4327h4.187v7.2959l8.111-7.2959h4.853l-7.184 6.5516 7.873 10.5831h-4.852l-5.922-7.9918-2.879 2.4718v5.52h-4.187V12.4327ZM152.167 12.4327h4.187v17.1347h-4.187V12.4327ZM160.778 12.4327h3.782l9.443 11.4468V12.4327h3.996v17.1347h-3.782l-9.443-11.4711v11.4711h-3.996V12.4327ZM181.424 21.0719c0-1.9363.412-3.5761 1.237-4.9195.825-1.3433 1.975-2.3719 3.449-3.0844 1.475-.711 3.178-1.068 5.114-1.068 2.41 0 4.309.5007 5.696 1.4991 1.387.9999 2.303 2.2918 2.747 3.8756l-4.186.4554c-.318-.8472-.829-1.4674-1.534-1.8592-.706-.3918-1.645-.5884-2.819-.5884-1.777 0-3.125.4916-4.044 1.4764-.919.9833-1.379 2.3644-1.379 4.1403 0 3.7441 1.989 5.6153 5.97 5.6153 1.761 0 3.244-.2647 4.449-.7912v-2.6397h-4.449v-3.1192H200v7.5833c-1.095.7518-2.356 1.3312-3.781 1.7396-1.426.4085-2.935.6127-4.52.6127-2.156 0-4-.3525-5.53-1.0559-1.53-.7034-2.703-1.7245-3.52-3.0602-.817-1.3358-1.225-2.9393-1.225-4.812ZM202 12.1186h2.093c.894 0 1.578.2041 2.053.6139.474.4098.71.9982.71 1.7667 0 .7686-.253 1.3525-.758 1.7638-.506.4113-1.226.6169-2.16.6169H202v-4.7613Zm4.008 2.3806c0-1.1287-.637-1.6931-1.91-1.6931h-1.281v3.3878h1.145c.673 0 1.182-.1426 1.528-.4263.346-.2837.518-.707.518-1.2669v-.0015ZM207.452 16.8799l2.297-4.7613h.887l2.296 4.7613h-.893l-.583-1.2263h-2.573l-.569 1.2263h-.862Zm2.722-3.9883-.996 2.1135h1.992l-.996-2.1135ZM213.52 14.4993c0-.5104.113-.9532.339-1.327.225-.3737.544-.6619.954-.8661.41-.2041.894-.3062 1.45-.3062.557 0 1.045.1021 1.453.3062.409.2042.724.4939.949.8661.224.3738.335.8151.335 1.327 0 .5118-.113.9486-.338 1.3239-.226.3752-.543.6664-.952.8706-.409.2041-.893.3062-1.453.3062-.559 0-1.038-.1021-1.45-.3062-.412-.2042-.729-.4939-.951-.8661-.224-.3738-.336-.8151-.336-1.3269v-.0015Zm.853 0c0 .5688.166 1.0132.497 1.3299.332.3182.796.4773 1.392.4773.596 0 1.053-.1606 1.384-.4803.332-.3197.497-.7626.497-1.3269 0-.5644-.165-1.0118-.494-1.33-.329-.3182-.793-.4773-1.389-.4773s-1.055.1591-1.389.4773c-.334.3182-.501.7611-.501 1.33h.003ZM36.914 0H3.08599C1.38164 0 0 1.38164 0 3.08599V36.914C0 38.6184 1.38164 40 3.08599 40H36.914C38.6184 40 40 38.6184 40 36.914V3.08599C40 1.38164 38.6184 0 36.914 0Z"
                  />
                  <path
                    fill="#7BF178"
                    d="m31.2456 14.5801-1.0948-.8538c-1.2729-.993-2.8413-1.5308-4.4545-1.5308H10.9599V6.00003h14.735c2.9918 0 5.8983.99876 8.2588 2.83827l1.0933.85235-3.8014 4.88795v.0015ZM23.0029 33.9986h-9.6505c-2.9919 0-5.89831-.9988-8.2588-2.8383l-1.09336-.8523 3.80141-4.888 1.09481.8523c1.27434.993 2.84274 1.5322 4.45744 1.5322h9.6505V34l-.0015-.0014ZM25.1087 16.9038h-9.4464c-2.5936 0-4.7036-2.1121-4.7036-4.7083H4.76932c0 6.0114 4.88607 10.9023 10.89158 10.9023h9.4463c2.5937 0 4.7036 2.112 4.7036 4.7082h6.1894c0-6.0114-4.886-10.9022-10.8915-10.9022Z"
                  />
                </svg>
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-dark-green-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XIcon className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flow-root mt-6">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="py-6 space-y-4">
                  <Link
                    className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                      pathname === '/' || pathname === '/stack' || pathname === '/unstack'
                        ? 'text-dark-green-600'
                        : 'text-gray-500'
                    }`}
                    href="/"
                  >
                    {pathname === '/' || pathname === '/stack' || pathname === '/unstack' ? (
                      <svg
                        className="w-2 h-2 text-fluor-green-500"
                        viewBox="0 0 8 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="4" cy="4" r="4" fill="currentColor" />
                      </svg>
                    ) : null}
                    Stacking
                  </Link>

                  <Link
                    className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                      pathname === '/points' ? 'text-dark-green-600' : 'text-gray-500'
                    }`}
                    href="/points"
                  >
                    {pathname === '/points' ? (
                      <svg
                        className="w-2 h-2 text-fluor-green-500"
                        viewBox="0 0 8 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="4" cy="4" r="4" fill="currentColor" />
                      </svg>
                    ) : null}
                    <div className="text-base">Points</div>
                  </Link>

                  <Link
                    className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                      pathname === '/defi' ? 'text-dark-green-600' : 'text-gray-500'
                    }`}
                    href="/defi"
                  >
                    {pathname === '/defi' ? (
                      <svg
                        className="w-2 h-2 text-fluor-green-500"
                        viewBox="0 0 8 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="4" cy="4" r="4" fill="currentColor" />
                      </svg>
                    ) : null}
                    <div className="text-base">DeFi</div>
                  </Link>

                  <Link
                    className={`flex h-fit pb-2 gap-2 items-center font-semibold ${
                      pathname === '/analytics' ? 'text-dark-green-600' : 'text-gray-500'
                    }`}
                    href="/analytics"
                  >
                    {pathname === '/analytics' ? (
                      <svg
                        className="w-2 h-2 text-fluor-green-500"
                        viewBox="0 0 8 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="4" cy="4" r="4" fill="currentColor" />
                      </svg>
                    ) : null}
                    <div className="text-base">Analytics</div>
                  </Link>
                </div>
                <div className="py-6">
                  <WalletConnectButton signOut={signOut} />
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </Container>
  );
}

function RootLayoutInner({ signOut, children }) {
  let panelId = useId();
  let [expanded, setExpanded] = useState(false);
  let openRef = useRef();
  let closeRef = useRef();
  let navRef = useRef();
  let shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    function onClick(event) {
      if (event.target.closest('a')?.href === window.location.href) {
        setExpanded(false);
      }
    }

    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
      <header>
        <div
          className="absolute left-0 right-0 z-10 pt-10 top-2"
          aria-hidden={expanded ? 'true' : undefined}
          inert={expanded ? '' : undefined}
        >
          <Header
            panelId={panelId}
            toggleRef={openRef}
            expanded={expanded}
            onToggle={() => {
              setExpanded(expanded => !expanded);
              window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }));
            }}
            signOut={signOut}
          />
        </div>

        <motion.div
          layout
          id={panelId}
          style={{ height: expanded ? 'auto' : '0rem' }}
          className="relative z-20 overflow-hidden bg-neutral-950"
          aria-hidden={expanded ? undefined : 'true'}
          inert={expanded ? undefined : ''}
        >
          <motion.div layout className="bg-neutral-800">
            <div ref={navRef} className="pt-10 pb-16 bg-neutral-950">
              <Header
                invert
                panelId={panelId}
                toggleRef={closeRef}
                expanded={expanded}
                onToggle={() => {
                  setExpanded(expanded => !expanded);
                  window.setTimeout(() => openRef.current?.focus({ preventScroll: true }));
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </header>

      <motion.div layout className="relative flex flex-auto overflow-hidden pt-14">
        <motion.div layout className="relative flex flex-col w-full isolate pt-9">
          <main className="flex-auto w-full">{children}</main>

          <Footer />
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
}

export function RootLayout({ signOut, children }) {
  let pathname = usePathname();
  let [logoHovered, setLogoHovered] = useState(false);

  return (
    <RootLayoutContext.Provider value={{ logoHovered, setLogoHovered }}>
      <RootLayoutInner key={pathname} signOut={signOut}>
        {children}
      </RootLayoutInner>
    </RootLayoutContext.Provider>
  );
}
