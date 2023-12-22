// @ts-nocheck

'use client'

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { RootLayout } from './components/RootLayout'
import React, { useEffect, useState } from 'react'
import { stacksNetwork } from './common/utils';
import { AppContextProvider } from './components/AppContext'
import { TxStatus } from './components/TxStatus';

import { Connect } from '@stacks/connect-react';
import { AuthOptions } from '@stacks/connect';
import { UserSession, AppConfig } from '@stacks/auth';

const inter = Inter({ subsets: ['latin'] })

export default function Layout({
  children
}: {
  children: React.ReactNode
}) {
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
    <html lang="en" className="h-full bg-neutral-950 text-base antialiased">
      <body className={`${inter.className} flex min-h-full flex-col`}>
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
      </body>
    </html>
  )
}
