import clsx from 'clsx';
import StxLogo from './Logos/Stx';

interface BannerProps {
  className: string;
}

// Note:
// We need to change the top padding of the header container in ./RootLayout.tsx
// to account for the Banner space because of the absolute position of the header
// from `pt-10` to `pt-24`

export function Banner({ className }: BannerProps) {
  return (
    <section className={clsx('relative z-20 bg-dark-green-500', className)}>
      <div className="px-3 py-4 mx-auto max-w-7xl lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm leading-8 text-white sm:text-base font-headings">
            Deposit <StxLogo className="inline mx-1.5 w-6 h-6" />
            STX Now <br className="sm:hidden" />
            And Get{' '}
            <span className="pt-2.5 ml-1.5 pb-2 px-3 bg-dark-green-800 text-fluor-green-500 rounded-md">
              20X Point Boost
            </span>
          </p>
          <div>
            <a
              href="https://medium.com/@stackingdao/the-nakamoto-odyssey-20x-point-boost-on-new-deposits-and-more-567c3a509112"
              target="_blank"
              role="button"
              className="flex items-center justify-center px-4 py-2 text-sm font-semibold bg-white rounded-md focus:outline-none active:bg-button-active hover:bg-button-hover text-dark-green-500"
            >
              Read More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
