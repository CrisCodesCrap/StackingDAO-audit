import {
  ClarityValue,
  noneCV,
  someCV,
  standardPrincipalCV,
  FungibleConditionCode,
  contractPrincipalCV,
  makeStandardSTXPostCondition,
  uintCV,
  callReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../AppContext/AppContext';

import { makeContractCall } from '@/app/common/contract-call';
import { stacksNetwork } from '@/app/common/utils';
import { StacksMainnet } from '@stacks/network';
import { useDebounce } from '@uidotdev/usehooks';

const bitflowOut = async (stxAddress: string, amountIn: number): Promise<number> => {
  const resultOut = await callReadOnlyFunction({
    contractAddress: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
    contractName: 'stableswap-stx-ststx-v-1-2',
    functionName: 'get-dy',
    functionArgs: [
      contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, 'ststx-token'),
      contractPrincipalCV('SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M', 'stx-ststx-lp-token-v-1-2'),
      uintCV(amountIn * 1000000),
    ],
    senderAddress: stxAddress,
    // Hiro API gives read error. This endpoint is from Bitflow.
    network: new StacksMainnet({
      url: 'https://anm8bm7vhj.execute-api.us-east-2.amazonaws.com/mainnet',
    }),
  });

  return cvToValue(resultOut).value / 1000000;
};

export function useReferral(referral?: string | null): [() => ClarityValue] {
  useEffect(() => {
    if (referral) localStorage.setItem('stacking-referral', referral);
  }, [referral]);

  return [
    () => {
      let referralParam: ClarityValue = noneCV();
      const referralString = referral || localStorage.getItem('stacking-referral');
      if (!!referralString) {
        referralParam = someCV(standardPrincipalCV(referralString));
      }

      return referralParam;
    },
  ];
}

interface StackingInput {
  amount: StackingDaoAmount;
  bitflow: BitflowAmount;
  internalAmount: number | undefined;
  updateRequestedAmount: (amount: number) => void;
  resetInput: VoidFunction;
}

interface StackingDaoAmount {
  stx: number;
  usd: number;
  ststx: number;
}

interface BitflowAmount {
  ststx: number;
  ratio?: number;
}

export function useStackingInput(): StackingInput {
  const { stxAddress, stxPrice, stxRatio } = useAppContext();

  const [internalValue, setInternalValue] = useState<number>();

  const [sdaoAmount, setSdaoAmount] = useState<StackingDaoAmount>({
    stx: 0.0,
    usd: 0.0,
    ststx: 0.0,
  });

  const [bitflowAmount, setBitflowAmount] = useState<BitflowAmount>({
    ststx: 0.0,
    ratio: undefined,
  });

  const debouncedAmount = useDebounce(internalValue, 200);

  useEffect(() => {
    if (!stxAddress) return;

    const amount = debouncedAmount ?? 0;
    const stxPriceFloat: number = !!stxPrice ? Number.parseFloat(stxPrice) : 0.0;
    const stxRatioFloat: number = !!stxRatio ? Number.parseFloat(stxRatio) : 1.0;

    setSdaoAmount({
      stx: amount,
      usd: stxPriceFloat * amount,
      ststx: amount / stxRatioFloat,
    });

    if (!debouncedAmount) return setBitflowAmount({ ststx: 0, ratio: undefined });

    bitflowOut(stxAddress, amount).then(receivedAmount =>
      setBitflowAmount({
        ststx: receivedAmount,
        ratio: receivedAmount / amount,
      })
    );
  }, [debouncedAmount, stxAddress, stxPrice, stxRatio]);

  const updateAmount = (amount: number) => setInternalValue(amount > 0 ? amount : undefined);

  return {
    amount: sdaoAmount,
    bitflow: bitflowAmount,
    internalAmount: internalValue,
    updateRequestedAmount: updateAmount,
    resetInput: () => setInternalValue(undefined),
  };
}

type StackingPartner = 'stackingdao' | 'bitflow';

type ButtonState = 'stack' | 'insufficient' | 'disabled';

interface StackingActions extends StackingInput {
  stackingPartner: StackingPartner;
  buttonState: ButtonState;
  setStackingPartner: Dispatch<SetStateAction<StackingPartner>>;
  onValidateAmount: (amount: number | undefined) => boolean;
  onMaxClicked: VoidFunction;
  stackStx: VoidFunction;
}

export function useStackingActions(stxAddress?: string, referral?: string | null): StackingActions {
  const { stxBalance, setCurrentTxId, setCurrentTxStatus } = useAppContext();
  const { amount, updateRequestedAmount, ...input } = useStackingInput();
  const [getReferral] = useReferral(referral);

  const [buttonState, setButtonState] = useState<ButtonState>('disabled');

  const [stackingPartner, setStackingPartner] = useState<StackingPartner>('stackingdao');

  useEffect(() => {
    let state: ButtonState = 'disabled';

    const maxBalance = stxBalance - 2;
    if (amount.stx > maxBalance) state = 'insufficient';
    else if (!amount.stx || !stxAddress) state = 'disabled';
    else state = 'stack';

    setButtonState(state);
  }, [amount, stxAddress, stxBalance]);

  const onMaxClicked = () => updateRequestedAmount(stxBalance - 2);

  const onValidateAmount = useCallback(
    (value: number | undefined) => (value ? value < stxBalance - 2 : true),
    [stxBalance]
  );

  const stackStx = async () => {
    if (!stxAddress) return;

    const stxAmount = amount.stx * 1000000;
    const postConditions = [
      makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, stxAmount),
    ];

    await makeContractCall(
      {
        stxAddress,
        contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
        contractName: 'stacking-dao-core-v2',
        functionName: 'deposit',
        functionArgs: [
          contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1'),
          contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'commission-v2'),
          contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'staking-v0'),
          contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'direct-helpers-v1'),
          uintCV(stxAmount),
          getReferral(),
          noneCV()
        ],
        postConditions,
        network: stacksNetwork,
      },
      async (_, txId?) => {
        input.resetInput();
        setCurrentTxId(txId);
        setCurrentTxStatus('pending');
      }
    );
  };

  return {
    ...input,
    amount,
    updateRequestedAmount,
    onMaxClicked,
    stackingPartner,
    setStackingPartner,
    buttonState,
    stackStx,
    onValidateAmount,
  };
}
