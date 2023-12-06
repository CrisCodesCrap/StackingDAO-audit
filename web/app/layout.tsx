// @ts-nocheck

'use client'

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { RootLayout } from './components/RootLayout'
import { ClientProvider } from '@micro-stacks/react'
import { useEffect, useState } from 'react'
import { stacksNetwork } from './common/utils';
import { AppContextProvider } from './components/AppContext'
import { TxStatus } from './components/TxStatus';

const inter = Inter({ subsets: ['latin'] })

export default function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    document.title = 'StackingDAO | Stack STX without locking your funds';
    document.description = 'Earn STX rewards without losing access to your funds';

    setIsClient(true);
  }, []);

  return (
    <html lang="en" className="h-full bg-neutral-950 text-base antialiased">
      <body className={`${inter.className} flex min-h-full flex-col`}>
        <ClientProvider
          appName="StackingDAO - Liquid Stacking"
          appIconUrl="/stdao-logo.jpg"
          network={stacksNetwork}
        >
          {isClient && (
            <AppContextProvider>
              <RootLayout>
                <TxStatus />

                {children}
              </RootLayout>
            </AppContextProvider>
          )}
        </ClientProvider>
      </body>
    </html>
  )
}
