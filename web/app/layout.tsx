// @ts-nocheck

'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { RootLayout } from './components/RootLayout';
import React, { useEffect, useState } from 'react';
import { AppContextProvider } from './components/AppContext/AppContext';
import { TxStatus } from './components/TxStatus';
import { Connect } from '@stacks/connect-react';
import { AuthOptions } from '@stacks/connect';
import { UserSession, AppConfig } from '@stacks/auth';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [userData, setUserData] = useState({});

  const appConfig = new AppConfig(['store_write', 'publish_data'], 'https://app.stackingdao.com');
  const userSession = new UserSession({ appConfig });
  const authOptions: AuthOptions = {
    redirectTo: '/',
    userSession,
    onFinish: ({ userSession }) => {
      const userData = userSession.loadUserData();
      setUserData(userData);
    },
    appDetails: {
      name: 'StackingDAO - Liquid Stacking',
      icon: 'https://stackingdao.com/_next/static/media/logo.00ae0d9a.png',
    },
  };

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userData);
    }
  }, []);

  const signOut = () => {
    userSession.signUserOut();
    localStorage.removeItem('stacking-sign-provider');
    window.location = '/';
  };

  const handleRedirectAuth = async () => {
    if (userSession.isSignInPending()) {
      const userData = await userSession.handlePendingSignIn();
      setUserData(userData);
    }
  };

  React.useEffect(() => {
    void handleRedirectAuth();
  }, []);

  useEffect(() => {
    document.title = 'StackingDAO | Stack STX without locking your funds';
    document.description = 'Earn STX rewards without losing access to your funds';

    setIsClient(true);
  }, []);

  return (
    <html lang="en" className="h-full text-base antialiased bg-neutral-100">
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?version=2.1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?version=2.1" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?version=2.1" />
        <link rel="manifest" href="/site.webmanifest?version=2.1" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?version=2.1" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico?version=2.1" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body className={`${inter.className} relative flex min-h-full flex-col`}>
        <Connect authOptions={authOptions}>
          {isClient && (
            <AppContextProvider userData={userData}>
              <RootLayout signOut={signOut}>
                <TxStatus />

                {children}
              </RootLayout>
            </AppContextProvider>
          )}
        </Connect>
        <svg
          className="absolute bottom-0 left-0 -z-10"
          xmlns="http://www.w3.org/2000/svg"
          width="241"
          height="210"
          fill="none"
        >
          <path
            fill="#E0E0E0"
            d="m205.2 64.3456-8.247-6.4008c-9.592-7.4438-21.398-11.4826-33.554-11.4826H52.4078V0H163.389c22.536 0 44.427 7.49489 62.204 21.2883l8.237 6.3906-28.64 36.6667h.01ZM143.119 209.99H70.4414c-22.5368 0-44.4272-7.495-62.20427-21.289L0 182.311l28.6402-36.667 8.2371 6.401c9.5912 7.444 21.4084 11.493 33.5641 11.493h72.6776V210v-.01ZM158.967 81.7688H87.818c-19.5312 0-35.4207-15.8384-35.4207-35.3067H5.78513c0 45.092 36.80557 81.7689 82.03287 81.7689h71.149c19.531 0 35.421 15.838 35.421 35.307H241c0-45.092-36.806-81.7692-82.033-81.7692Z"
          />
        </svg>
      </body>
    </html>
  );
}
