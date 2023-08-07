'use client'

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { RootLayout } from './components/RootLayout'
import { ClientProvider } from '@micro-stacks/react'
import { useCallback, useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

const metadata: Metadata = {
  title: 'Sticky | Stack STX without locking your funds',
  description: 'Earn STX rewards without losing access to your funds',
}

export default function Layout({
  children,
  pageProps
}: {
  children: React.ReactNode,
  pageProps: any
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onPersistState: ClientConfig['onPersistState'] = useCallback(
    async (dehydratedState: string) => {
      // TODO
      console.log('Saving state:', dehydratedState);
    },
    []
  );

  const onSignOut: ClientConfig['onSignOut'] = useCallback(async () => {
    console.log('Forgetting state...');
  }, []);

  return (
    <html lang="en" className="h-full bg-neutral-950 text-base antialiased">
      <body className={`${inter.className} flex min-h-full flex-col`}>
        <ClientProvider
          appName="Sticky - Liquid Stacking"
          appIconUrl="/vercel.png"
          dehydratedState={pageProps?.dehydratedState}
          onPersistState={onPersistState}
          onSignOut={onSignOut}
        >
          {isClient && (
            <RootLayout>{children}</RootLayout>
          )}
        </ClientProvider>
      </body>
    </html>
  )
}
