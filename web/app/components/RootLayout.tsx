'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'

import { WalletConnectButton } from './WalletConnectButton'
import { Container } from './Container'
import { Footer } from './Footer'
import { GridPattern } from './GridPattern'
import { Logo, Logomark } from './Logo'

const RootLayoutContext = createContext({})

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m5.636 4.223 14.142 14.142-1.414 1.414L4.222 5.637z" />
      <path d="M4.222 18.363 18.364 4.22l1.414 1.414L5.636 19.777z" />
    </svg>
  )
}

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M2 6h20v2H2zM2 16h20v2H2z" />
    </svg>
  )
}

function Header({
  panelId,
  invert = false,
  icon: Icon,
  expanded,
  onToggle,
  toggleRef,
}) {
  let { logoHovered, setLogoHovered } = useContext(RootLayoutContext);
  const pathname = usePathname();

  return (
    <Container>
      <div className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Home"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <Logomark
            className="h-8 sm:hidden"
            invert={invert}
            filled={logoHovered}
          />
          <div className="flex items-center hidden h-8 sm:block mt-4">
            <span className="font-semibold">StackingDAO</span>
          </div>
        </Link>
        <div className="flex justify-center items-center gap-7">
          <Link className={`flex h-fit pt-3 pb-2 gap-2 items-center font-semibold border-b-4 ${pathname === '/' || pathname === '/stack' || pathname === '/unstack' ? 'text-primary border-primary' : 'border-transparent'}`} href="/">
            <svg className={`${pathname === '/' ? 'text-primary' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24">
              <g id="stakingLogo">
                <path id="color" fillRule="evenodd" clipRule="evenodd" d="M22.1797 11.4445C22.944 7.88526 19.1963 4.06208 13.8089 2.90515C8.4215 1.74823 3.43454 3.69566 2.67021 7.25486C1.90589 10.8141 5.65363 14.6372 11.041 15.7942C16.4284 16.9511 21.4154 15.0037 22.1797 11.4445ZM15.2979 7.1407C15.0836 6.92641 14.8607 6.75498 14.6036 6.60927C14.415 6.49784 14.2179 6.40355 14.0036 6.32641L14.1922 5.58927C14.2093 5.53784 14.1922 5.47784 14.1664 5.42641C14.1407 5.37498 14.0893 5.34069 14.0379 5.32355L13.2493 5.11784C13.1893 5.10927 13.1379 5.11784 13.0864 5.14355C13.035 5.16927 13.0007 5.2207 12.9836 5.27212L12.7864 6.01784C12.435 5.96641 12.1179 5.96641 11.8436 6.00927C11.4407 6.06927 11.0979 6.20641 10.8236 6.41212C10.5407 6.62641 10.3522 6.91784 10.2579 7.26927C10.1379 7.71498 10.215 8.13498 10.4722 8.49498C10.7207 8.83784 11.1322 9.14641 11.7322 9.42069L12.6836 9.84927C12.9322 9.96069 13.1293 10.0721 13.2579 10.175C13.3779 10.2607 13.455 10.355 13.4893 10.4321C13.5236 10.5093 13.5236 10.5864 13.4979 10.6721C13.4636 10.7921 13.4122 10.8778 13.3093 10.9464C13.2064 11.015 13.0522 11.0578 12.8464 11.075C12.6236 11.0921 12.3579 11.0493 12.0322 10.9636C11.6207 10.8607 11.2864 10.7236 11.0207 10.5778C10.8664 10.4836 10.7293 10.3978 10.6093 10.3036C10.5493 10.2607 10.4636 10.2521 10.395 10.2778L9.63216 10.6207C9.56359 10.655 9.52073 10.715 9.51216 10.7836C9.50359 10.8521 9.52931 10.9293 9.58073 10.9721C9.80359 11.1693 10.0864 11.3664 10.4122 11.5464C10.6436 11.675 10.9179 11.795 11.2436 11.8978L11.055 12.6178C11.0293 12.7293 11.0893 12.8493 11.2093 12.8836L11.9979 13.0893H12.0493C12.0836 13.0893 12.1264 13.0807 12.1607 13.0636C12.2122 13.0378 12.2464 12.9864 12.2636 12.935L12.4607 12.1807C12.795 12.215 13.0864 12.215 13.3436 12.1807C13.7379 12.1293 14.0722 12.0093 14.3464 11.8121C14.6293 11.6064 14.8264 11.3321 14.9122 10.9893C15.0236 10.5436 14.9464 10.1407 14.6636 9.78069C14.3979 9.44641 13.9693 9.14641 13.3436 8.85498L12.375 8.41784C11.9636 8.22927 11.7922 8.07498 11.7236 7.9807C11.6379 7.86927 11.6122 7.74927 11.6464 7.60355C11.6979 7.39784 11.835 7.26927 12.075 7.19212C12.3407 7.10641 12.6836 7.11498 13.0864 7.21784C13.4122 7.30355 13.6779 7.40641 13.8922 7.52641C13.995 7.58641 14.0722 7.64641 14.1579 7.71498L14.2436 7.78355C14.3036 7.83498 14.3893 7.84355 14.4664 7.80927L15.2036 7.48355C15.2636 7.45784 15.315 7.39784 15.3236 7.32927C15.3322 7.26069 15.315 7.19212 15.2636 7.1407H15.2979ZM3.74355 12.3778C4.11213 12.8578 4.54927 13.3293 5.05498 13.775V13.7664C8.86927 17.5978 17.6464 18.875 21.6407 14.8721C20.415 17.4093 17.3464 19.6893 13.4978 20.5978C8.12355 21.875 3.2807 19.9893 2.68927 16.3978C2.46641 15.0521 2.86927 13.6636 3.74355 12.3778Z" fill="fillColor"></path>
              </g>
            </svg>
            <div className="text-base">Stacking</div>
          </Link>
          <Link className={`flex h-fit pt-3 pb-2 gap-2 items-center font-semibold border-b-4 ${pathname === '/defi' ? 'text-primary border-primary' : 'border-transparent'}`} href="/defi">
            <svg className={`${pathname === '/defi' ? 'text-primary' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24">
              <g id="liquidityLogo">
                <path id="color" fillRule="evenodd" clipRule="evenodd" d="M12.6087 7.83428V8.53715C12.6087 9.23144 13.3972 9.62573 13.9458 9.20573L17.8972 6.2143C18.3344 5.88001 18.3344 5.22001 17.8972 4.88573L13.9458 1.88573C13.3887 1.46573 12.6087 1.86001 12.6087 2.5543V3.26573C9.33443 3.41148 6.41162 5.35718 4.78306 8.04001C5.75164 8.58858 6.72878 9.10287 7.72306 9.58287C7.88592 9.41144 8.05735 9.25715 8.24592 9.11144C9.52304 8.08289 11.1258 7.65432 12.6087 7.83428ZM20.1515 10.4486C20.1515 11.5886 19.9115 12.6943 19.4915 13.7314C18.4629 13.4829 17.4429 13.2086 16.4229 12.9086C16.9972 12.1372 17.4086 11.2372 17.5972 10.2514C17.6658 9.90858 17.9829 9.66858 18.3343 9.66858H19.3886C19.8172 9.66858 20.1515 10.02 20.1515 10.4486ZM15.9516 13.4657C15.763 13.6714 15.5573 13.86 15.343 14.0314C14.0659 15.06 12.463 15.4886 10.9802 15.3086V19.8772C14.3145 19.7314 17.2888 17.7172 18.8916 14.9572C17.923 14.4343 16.9459 13.9372 15.9516 13.4657ZM10.9716 20.5886V14.6057C10.9716 13.9114 10.183 13.5172 9.63448 13.9372L5.68305 16.9286C5.2459 17.2629 5.2459 17.9229 5.68305 18.2572L9.63448 21.2572C10.1916 21.6772 10.9716 21.2829 10.9716 20.5886ZM4.09728 9.3943L4.09659 9.39598L4.08871 9.3943H4.09728ZM4.09659 9.39598C3.66845 10.4327 3.42871 11.5464 3.42871 12.6943C3.42871 13.1229 3.763 13.4743 4.19157 13.4743H5.24585C5.59728 13.4743 5.91443 13.2343 5.983 12.8914C6.18014 11.88 6.60871 10.9543 7.20014 10.1743C6.17415 9.88361 5.13963 9.6185 4.09659 9.39598Z" fill="currentFill"></path>
              </g>
            </svg>
            <div className="text-base">DeFi</div>
          </Link>
          <Link className={`flex h-fit pt-3 pb-2 gap-2 items-center font-semibold border-b-4 ${pathname === '/stdao' ? 'text-primary border-primary' : 'border-transparent'}`} href="/stdao">
            <svg className={`${pathname === '/stdao' ? 'text-primary' : ''}`} width="32" height="32" aria-hidden="true" preserveAspectRatio="xMinYMid meet"><rect clipPath="url(#:r2j:-clip)" className="h-8 transition-all duration-300 fill-neutral-950 w-0 group-hover/logo:w-8"></rect><use href="#:r2j:-path" className="stroke-neutral-950" fill="none" strokeWidth="1.5"></use><defs><path id=":r2j:-path" d="M3.25 26v.75H7c1.305 0 2.384-.21 3.346-.627.96-.415 1.763-1.02 2.536-1.752.695-.657 1.39-1.443 2.152-2.306l.233-.263c.864-.975 1.843-2.068 3.071-3.266 1.209-1.18 2.881-1.786 4.621-1.786h5.791V5.25H25c-1.305 0-2.384.21-3.346.627-.96.415-1.763 1.02-2.536 1.751-.695.658-1.39 1.444-2.152 2.307l-.233.263c-.864.975-1.843 2.068-3.071 3.266-1.209 1.18-2.881 1.786-4.621 1.786H3.25V26Z"></path><clipPath id=":r2j:-clip"><use href="#:r2j:-path"></use></clipPath></defs></svg>
            <div className="text-base">STDAO</div>
          </Link>
        </div>
        <div className="flex items-center gap-x-8">
          <WalletConnectButton />
        </div>
      </div>
    </Container>
  )
}

function RootLayoutInner({ children }) {
  let panelId = useId()
  let [expanded, setExpanded] = useState(false)
  let openRef = useRef()
  let closeRef = useRef()
  let navRef = useRef()
  let shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    function onClick(event) {
      if (event.target.closest('a')?.href === window.location.href) {
        setExpanded(false)
      }
    }

    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
      <header>
        <div
          className="absolute left-0 right-0 top-2 z-40 pt-14"
          aria-hidden={expanded ? 'true' : undefined}
          inert={expanded ? '' : undefined}
        >
          <Header
            panelId={panelId}
            icon={MenuIcon}
            toggleRef={openRef}
            expanded={expanded}
            onToggle={() => {
              setExpanded((expanded) => !expanded)
              window.setTimeout(() =>
                closeRef.current?.focus({ preventScroll: true })
              )
            }}
          />
        </div>

        <motion.div
          layout
          id={panelId}
          style={{ height: expanded ? 'auto' : '0.5rem' }}
          className="relative z-50 overflow-hidden bg-neutral-950 pt-2"
          aria-hidden={expanded ? undefined : 'true'}
          inert={expanded ? undefined : ''}
        >
          <motion.div layout className="bg-neutral-800">
            <div ref={navRef} className="bg-neutral-950 pb-16 pt-14">
              <Header
                invert
                panelId={panelId}
                icon={XIcon}
                toggleRef={closeRef}
                expanded={expanded}
                onToggle={() => {
                  setExpanded((expanded) => !expanded)
                  window.setTimeout(() =>
                    openRef.current?.focus({ preventScroll: true })
                  )
                }}
              />
            </div>          </motion.div>
        </motion.div>
      </header>

      <motion.div
        layout
        style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
        className="relative flex flex-auto overflow-hidden bg-white pt-14"
      >
        <motion.div
          layout
          className="relative isolate flex w-full flex-col pt-9"
        >
          <GridPattern
            className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full fill-neutral-50 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
            yOffset={-96}
            interactive
          />

          <main className="w-full flex-auto">{children}</main>

          <Footer />
        </motion.div>
      </motion.div>
    </MotionConfig>
  )
}

export function RootLayout({ children }) {
  let pathname = usePathname()
  let [logoHovered, setLogoHovered] = useState(false)

  return (
    <RootLayoutContext.Provider value={{ logoHovered, setLogoHovered }}>
      <RootLayoutInner key={pathname}>{children}</RootLayoutInner>
    </RootLayoutContext.Provider>
  )
}
