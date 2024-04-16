import {
  ClarityValue,
  FungibleConditionCode,
  callReadOnlyFunction,
  contractPrincipalCV,
  createAssetInfo,
  cvToValue,
  makeContractFungiblePostCondition,
  makeStandardSTXPostCondition,
  noneCV,
  someCV,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../AppContext/AppContext';

import { ContractCallOptions, makeContractCall } from '@/app/common/contract-call';
import { stacksNetwork } from '@/app/common/utils';
import { StacksMainnet } from '@stacks/network';
import { useDebounce } from '@uidotdev/usehooks';

// Slippage tolerance for swapping using bitflow.
const SLIPPAGE_TOLERANCE = 0.04;

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

export function useStackingActions(stxAddress?: string, referral?: string): StackingActions {
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

  const stackStx = useCallback(async () => {
    if (!stxAddress) return;

    const stxAmount = amount.stx * 1000000;
    const stStxAmount = Math.floor(amount.ststx * 1000000 * (1 - SLIPPAGE_TOLERANCE));

    let contract: ContractCallOptions;
    switch (stackingPartner) {
      case 'stackingdao':
        contract = {
          stxAddress,
          contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS!,
          contractName: 'stacking-dao-core-v1',
          functionName: 'deposit',
          functionArgs: [
            contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'reserve-v1'),
            uintCV(stxAmount),
            getReferral(),
          ],
          postConditions: [
            makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, stxAmount),
          ],
          network: stacksNetwork,
        };
        break;
      case 'bitflow':
        contract = {
          stxAddress,
          contractAddress: 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
          contractName: 'stableswap-stx-ststx-v-1-2',
          functionName: 'swap-x-for-y',
          functionArgs: [
            contractPrincipalCV(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, 'ststx-token'),
            contractPrincipalCV(
              'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
              'stx-ststx-lp-token-v-1-2'
            ),
            uintCV(stxAmount),
            uintCV(stStxAmount),
          ],
          postConditions: [
            makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.Equal, stxAmount),
            makeContractFungiblePostCondition(
              'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M',
              'stableswap-stx-ststx-v-1-2',
              FungibleConditionCode.GreaterEqual,
              stStxAmount,
              createAssetInfo(process.env.NEXT_PUBLIC_STSTX_ADDRESS!, 'ststx-token', 'stSTX')
            ),
          ],
          network: stacksNetwork,
        };
        break;
    }

    await makeContractCall(contract, async (_, txId?) => {
      input.resetInput();
      setCurrentTxId(txId);
      setCurrentTxStatus('pending');
    });
  }, [
    amount.ststx,
    amount.stx,
    getReferral,
    input,
    setCurrentTxId,
    setCurrentTxStatus,
    stackingPartner,
    stxAddress,
  ]);

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
