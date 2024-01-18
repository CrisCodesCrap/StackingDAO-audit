import Link from 'next/link'
import { Container } from './Container'

export function Footer() {
  return (
    <Container as="footer" className="mt-16 w-full">
      <div className="mb-12 mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-neutral-950/10 pt-4">
        <p className="text-sm text-neutral-700">
          © StackingDAO Inc. {new Date().getFullYear()}
        </p>

        <p className="text-sm text-neutral-700 flex flex-wrap gap-x-8 gap-y-3">
          <a href="https://www.coinfabrik.com/blog/stacking-dao-audit/" target="_blank" className="flex items-center gap-2">
            Audited by <img src="/coinfabrik-logo.png" className="w-24" />
          </a>
          <a href="https://github.com/StackingDAO/contracts" target="_blank" className="flex items-center gap-2">
            GitHub <img src="/github-logo.png" className="w-5" />
          </a>
          <a href="https://www.stackingdao.com/tos" className="flex items-center gap-2">
            Terms of Service
          </a>
          <a href="https://docs.stackingdao.com" target="_blank" className="flex items-center gap-2">
            Documentation
          </a>
          <a href="/cycles" className="flex items-center gap-2">
            Cycles
          </a>
          <a href="https://t.me/+0jPjegAOoMwyNTU0" target="_blank" className="flex items-center gap-2">
            Community <img src="/tg-logo.png" className="w-4" />
          </a>
          <a href="https://twitter.com/stackingdao" target="_blank" className="flex items-center">
            <img src="/x-logo-black.png" className="w-4" />
          </a>
        </p>
      </div>
    </Container>
  )
}
