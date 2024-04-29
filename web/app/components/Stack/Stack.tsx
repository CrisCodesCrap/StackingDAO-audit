'use client';

import Link, { LinkProps } from 'next/link';
import { PropsWithChildren, useState } from 'react';
import { NumericFormat } from 'react-number-format';

import { cn } from '@/app/common/class-names';
import { useSTXAddress } from '@/app/common/use-stx-address';
import { useAppContext } from '@/app/components/AppContext/AppContext';
import { Badge } from '@/app/components/Badge/Badge';
import { CommissionModal } from '@/app/components/CommissionModal';
import { useStackingActions } from '@/app/components/Stack/Stack.hook';
import STXIcon from '@/app/components/Logos/Stx';
import StSTXIcon from '@/app/components/Logos/StStx';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import { currency } from '@/app/common/utils';

export function Stack() {
  const stxAddress = useSTXAddress();

  const [showApyInfo, setShowApyInfo] = useState<boolean>(false);

  const { stxBalance, stxRatio, stackingApy } = useAppContext();
  const {
    amount,
    bitflow,
    referral: referralAddress,
    internalAmount,
    updateRequestedAmount,
    // onValidateAmount,
    onMaxClicked,
    stackingPartner,
    setStackingPartner,
    buttonState,
    stackStx,
  } = useStackingActions(stxAddress);

  return (
    <div className="flex items-center justify-center rounded-xl bg-white p-8 shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A] md:p-12">
      <div className="flex min-h-full w-full flex-col md:max-w-xl">
        <div className="flex w-full items-center justify-start gap-2 text-2xl md:text-2xl">
          <Link href="/">
            <ArrowLeftIcon width={24} height={24} className="text-dark-green-600" strokeWidth={3} />
          </Link>
          <span className="flex-grow font-headings text-sd-gray-darker">Stack</span>

          {referralAddress && (
            <div className="relative flex items-center text-sm" id="referralAddress">
              <Tooltip anchorSelect="#referralAddress" place="top">
                You are using {referralAddress} as referral address
              </Tooltip>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="inline mr-2"
              >
                <circle cx="12" cy="12" r="12" fill="#1D3730" />
                <path
                  d="M10 15.3334H8.66671C7.78265 15.3334 6.93481 14.9822 6.30968 14.3571C5.68456 13.732 5.33337 12.8841 5.33337 12.0001C5.33337 11.116 5.68456 10.2682 6.30968 9.64306C6.93481 9.01794 7.78265 8.66675 8.66671 8.66675H10"
                  stroke="#7BF178"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 8.66675H15.3333C16.2174 8.66675 17.0652 9.01794 17.6904 9.64306C18.3155 10.2682 18.6667 11.116 18.6667 12.0001C18.6667 12.8841 18.3155 13.732 17.6904 14.3571C17.0652 14.9822 16.2174 15.3334 15.3333 15.3334H14"
                  stroke="#7BF178"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.33337 12H14.6667"
                  stroke="#7BF178"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-semibold">Referral link</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="inline ml-1.5"
              >
                <g clipPath="url(#clip0_452_1675)">
                  <path
                    d="M7.99992 14.6668C11.6818 14.6668 14.6666 11.6821 14.6666 8.00016C14.6666 4.31826 11.6818 1.3335 7.99992 1.3335C4.31802 1.3335 1.33325 4.31826 1.33325 8.00016C1.33325 11.6821 4.31802 14.6668 7.99992 14.6668Z"
                    stroke="#797C80"
                    strokeWidth="1.42857"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.05994 5.99989C6.21667 5.55434 6.52604 5.17863 6.93324 4.93931C7.34044 4.7 7.8192 4.61252 8.28472 4.69237C8.75024 4.77222 9.17248 5.01424 9.47665 5.37558C9.78083 5.73691 9.94731 6.19424 9.9466 6.66656C9.9466 7.99989 7.9466 8.66656 7.9466 8.66656"
                    stroke="#797C80"
                    strokeWidth="1.42857"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 11.3335H8.00648"
                    stroke="#797C80"
                    strokeWidth="1.42857"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_452_1675">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          )}
        </div>
        <div className="mt-6 w-full">
          <div className="w-full overflow-x-hidden rounded-lg bg-sd-gray-light p-6 font-medium">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="block text-sm text-sd-gray">Balance</span>
                <div className="flex items-center gap-1.5 text-base">
                  {stxBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                  <STXIcon width={14} height={14} />
                </div>
              </div>
              <div className="">
                <button
                  type="button"
                  className="rounded-md bg-dark-green-600 px-4 py-2 text-fluor-green-500"
                  onClick={onMaxClicked}
                >
                  Max
                </button>
              </div>
            </div>
            <div className="relative mb-5 mt-6 flex max-w-full flex-col items-center overflow-x-clip">
              <div className="relative">
                <div className="inline-block w-full text-center text-5xl">
                  <NumericFormat
                    autoFocus
                    placeholder="0.0"
                    value={internalAmount}
                    defaultValue=""
                    displayType="input"
                    className="bg-sd-gray-light text-center !outline-none"
                    onValueChange={values => updateRequestedAmount(values.floatValue ?? 0.0)}
                    allowLeadingZeros={false}
                    allowNegative={false}
                    thousandSeparator={true}
                    thousandsGroupStyle="thousand"
                    // fixedDecimalScale
                    decimalScale={6}
                    // isAllowed={value => onValidateAmount(value.floatValue)}
                  />
                </div>
              </div>
              <span className="text-sd-gray">~${amount.usd.toLocaleString('en-US')}</span>
            </div>
          </div>

          <div className="grid gap-x-2 grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
            <StackingPartner
              name="Deposit with us"
              logo="/sdao.svg"
              // selected={stackingPartner === 'stackingdao'}
              selected={false}
              onClick={() => setStackingPartner('stackingdao')}
              ratio={1 / parseFloat(stxRatio ?? '1')}
              referral={
                referralAddress
                  ? `${referralAddress.slice(0, 4)}...${referralAddress.slice(-4)}`
                  : undefined
              }
            />
            {/*<StackingPartner
              name="Swap with Bitflow"
              logo="/bitflow-logo.png"
              selected={stackingPartner === 'bitflow'}
              onClick={() => setStackingPartner('bitflow')}
              recommended={(bitflow?.ratio ?? 0) > 1 / parseFloat(stxRatio ?? '0')}
              ratio={bitflow.ratio}
            />*/}
          </div>

          <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-sd-gray-light p-6 text-center font-medium">
            <div className="flex flex-row justify-center gap-1">
              <span className="text-gray-600">
                {stackingPartner === 'stackingdao'
                  ? 'You receive:'
                  : "You're expected to receive: "}
              </span>
              {Number.isNaN(amount.stx) ? (
                <span> - </span>
              ) : (
                <span className="flex flex-row gap-1">
                  ~
                  {(stackingPartner === 'stackingdao'
                    ? amount.ststx
                    : bitflow.ststx
                  ).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <StSTXIcon width={20} height={20} />
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row justify-center gap-1 text-sm">
                <span className="text-gray-600">Projected yield:</span>~{stackingApy}% APY
              </div>
              <button
                type="button"
                onClick={() => setShowApyInfo(true)}
                className="flex w-fit items-center gap-1 rounded border border-transparent bg-sd-gray/[.08] px-1.5 py-1 text-xs text-sd-gray hover:border-sd-gray/20"
              >
                Includes a 5% performance fee
                <QuestionMarkCircleIcon width={14} height={14} />
              </button>
            </div>
          </div>

          <LinkButton
            type={stackingPartner === 'bitflow' ? 'link' : 'button'}
            href="https://app.bitflow.finance/trade"
          >
            <button
              type="button"
              className="active:bg-button-active hover:bg-button-hover mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-lg bg-dark-green-600 px-6 text-xl font-semibold text-white focus:outline-none disabled:bg-opacity-50"
              disabled={buttonState !== 'stack'}
              onClick={stackingPartner === 'stackingdao' ? stackStx : undefined}
            >
              {buttonState === 'insufficient' ? 'Insufficient Balance' : 'Confirm Stack'}
            </button>
          </LinkButton>
        </div>
      </div>

      {showApyInfo && <CommissionModal open={showApyInfo} setOpen={setShowApyInfo} />}
    </div>
  );
}

// This is a hack until we fix button styling altogether

interface LinkButtonProps extends LinkProps {
  type: 'link' | 'button';
}

const LinkButton = ({ type, href, children, ...props }: PropsWithChildren<LinkButtonProps>) =>
  type === 'button' ? (
    children
  ) : (
    <Link {...props} href={href} target="_blank" referrerPolicy="no-referrer" passHref>
      {children}
    </Link>
  );

interface StackingPartnerProps {
  name: string;
  logo: string;
  selected: boolean;
  onClick: VoidFunction;
  recommended?: boolean;
  ratio?: number;
  referral?: string;
}

function StackingPartner({
  name,
  logo,
  selected,
  onClick,
  recommended,
  ratio,
  referral,
}: StackingPartnerProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative mt-4 w-full cursor-pointer grid gap-4 rounded-lg border-2 bg-sd-gray-light p-6 font-medium hover:bg-sd-gray-dark',
        selected ? 'border-dark-green-600' : 'border-transparent'
      )}
    >
      <div className="flex flex-row items-center justify-between">
        <p className="mr-2 text-sm">{name}</p>
        {/*<Image
          src={logo}
          alt=""
          className="h-6 w-6 rounded-full bg-dark-green-600"
          width={100}
          height={100}
        />*/}
      </div>
      {recommended && (
        <Badge
          id="recommended"
          text="Recommended"
          className="absolute -top-3 right-2 max-w-fit"
          suffixIcon={
            <>
              <InformationCircleIcon width={12} height={12} />
              <Tooltip anchorSelect="#recommended" place="top">
                Lower premium available via Bitflow.
              </Tooltip>
            </>
          }
        />
      )}
      {selected && (
        <Badge
          id="selected"
          text="Selected"
          className="absolute -top-3 left-2 max-w-fit"
          suffixIcon={<CheckCircleIcon width={12} height={12} />}
        />
      )}
      <div className="flex flex-row justify-between">
        <p className="text-left text-sm text-gray-600">Ratio:</p>
        <p className="flex flex-row text-right text-sm font-semibold gap-1 items-center">
          {!!ratio ? (
            <>
              <STXIcon width={16} height={16} />1 = {currency.long.format(ratio)}
              <StSTXIcon width={16} height={16} />
            </>
          ) : (
            '-'
          )}
        </p>
      </div>
      {!!referral && (
        <div className="flex flex-row justify-between">
          <p className="text-left text-sm text-gray-600">Referral:</p>
          <p className="flex flex-row text-right text-sm font-semibold gap-1 items-center">
            {referral}
          </p>
        </div>
      )}
    </div>
  );
}
