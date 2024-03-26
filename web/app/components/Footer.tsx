import Link from 'next/link';
import { Container } from './Container';

export function Footer() {
  return (
    <Container as="footer" className="mt-16 w-full">
      <div className="mb-12 mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-neutral-950/10 pt-4">
        <p className="text-sm text-neutral-700">© Symmachia Inc. {new Date().getFullYear()}</p>

        <p className="text-sm text-neutral-700 flex flex-wrap gap-x-8 gap-y-3">
          <a
            href="https://www.coinfabrik.com/blog/stacking-dao-audit/"
            target="_blank"
            className="flex items-center gap-2 lg:w-fit w-full"
          >
            Audited by <img src="/coinfabrik-logo.png" className="w-24" />
          </a>

          <a href="https://www.stackingdao.com/tos" className="flex items-center lg:w-fit w-full">
            Terms of Service
          </a>
          <a
            href="https://docs.stackingdao.com"
            target="_blank"
            className="flex items-center lg:w-fit w-full"
          >
            Documentation
          </a>
          <a href="/cycles" className="flex items-center lg:w-fit w-full">
            Cycles
          </a>

          <a
            href="https://discord.gg/bFU8JSnPP7"
            target="_blank"
            className="flex items-center lg:mt-0 mt-4"
          >
            <img src="/discord-logo.svg" className="w-6" />
          </a>
          <a
            href="https://twitter.com/stackingdao"
            target="_blank"
            className="flex items-center lg:mt-0 mt-4"
          >
            <img src="/x-logo.svg" className="w-6" />
          </a>
          <a
            href="https://medium.com/@stackingdao"
            target="_blank"
            className="flex items-center lg:mt-0 mt-4"
          >
            <img src="/medium-logo.png" className="w-6" />
          </a>
          <a
            href="https://github.com/StackingDAO/contracts"
            target="_blank"
            className="flex items-center lg:mt-0 mt-4"
          >
            <img src="/github-logo.svg" className="w-8" />
          </a>
        </p>
      </div>
    </Container>
  );
}
