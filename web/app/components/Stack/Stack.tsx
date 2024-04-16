'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { useSearchParams } from 'next/navigation';

export function Stack() {
  const params = useSearchParams();
  const stxAddress = useSTXAddress();

  const [showApyInfo, setShowApyInfo] = useState<boolean>(false);

  const { stxBalance, stxRatio, stackingApy } = useAppContext();
  const {
    amount,
    bitflow,
    internalAmount,
    updateRequestedAmount,
    // onValidateAmount,
    onMaxClicked,
    stackingPartner,
    setStackingPartner,
    buttonState,
    stackStx,
  } = useStackingActions(stxAddress, params.get('referral'));

  return (
    <div className="flex items-center justify-center rounded-xl bg-white p-8 shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A] md:p-12">
      <div className="flex min-h-full w-full flex-col md:max-w-xl">
        <div className="flex w-full items-center justify-start gap-2 text-2xl md:text-2xl">
          <Link href="/">
            <ArrowLeftIcon width={24} height={24} className="text-dark-green-600" strokeWidth={3} />
          </Link>
          <span className="flex-grow font-headings text-sd-gray-darker">Stack</span>
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

          <div className="grid gap-x-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <StackingPartner
              name="Deposit with us"
              logo="/sdao.svg"
              selected={stackingPartner === 'stackingdao'}
              onClick={() => setStackingPartner('stackingdao')}
              ratio={1 / parseFloat(stxRatio ?? '1')}
            />
            <StackingPartner
              name="Swap with Bitflow"
              logo="/bitflow-logo.png"
              selected={stackingPartner === 'bitflow'}
              onClick={() => setStackingPartner('bitflow')}
              recommended={(bitflow?.ratio ?? 0) > 1 / parseFloat(stxRatio ?? '0')}
              ratio={bitflow.ratio}
            />
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
                  {currency.short.format(
                    stackingPartner === 'stackingdao' ? amount.ststx : bitflow.ststx
                  )}
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

          <button
            type="button"
            className="active:bg-button-active hover:bg-button-hover mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-lg bg-dark-green-600 px-6 text-xl font-semibold text-white focus:outline-none disabled:bg-opacity-50"
            disabled={buttonState !== 'stack'}
            onClick={stackStx}
          >
            {buttonState === 'insufficient' ? 'Insufficient Balance' : 'Confirm Stack'}
          </button>
        </div>
      </div>

      {showApyInfo && <CommissionModal open={showApyInfo} setOpen={setShowApyInfo} />}
    </div>
  );
}

interface StackingPartnerProps {
  name: string;
  logo: string;
  selected: boolean;
  onClick: VoidFunction;
  recommended?: boolean;
  ratio?: number;
}

function StackingPartner({
  name,
  logo,
  selected,
  onClick,
  recommended,
  ratio,
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
    </div>
  );
}
