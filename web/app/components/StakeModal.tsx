// @ts-nocheck

import React, { useContext, useState, useRef } from 'react';
import { Modal } from './Modal';
import { InputAmount } from './InputAmount';
import { Alert } from './Alert';
import { stacksNetwork as network } from '../common/utils';
import { useAppContext } from './AppContext'
import { useSTXAddress } from '../common/use-stx-address';
import { useConnect } from '@stacks/connect-react';
import {
  uintCV, contractPrincipalCV,
  FungibleConditionCode,
  createFungiblePostCondition,
  createAssetInfo,
} from '@stacks/transactions'
import { stacksNetwork } from '../common/utils';

interface Props {
  showStakeModal: boolean;
  setShowStakeModal: (arg: boolean) => void;
  apy: number;
}

export const StakeModal: React.FC<Props> = ({ showStakeModal, setShowStakeModal, apy }) => {
  const stxAddress = useSTXAddress();
  const { doContractCall } = useConnect();

  const [errors, setErrors] = useState<string[]>([]);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [isStakeButtonDisabled, setIsStakeButtonDisabled] = useState(false);
  const contractAddress = process.env.NEXT_PUBLIC_STSTX_ADDRESS || '';
  const { sDaoBalance, setCurrentTxId, setCurrentTxStatus } = useAppContext();

  const inputRef = useRef<HTMLInputElement>(null);

  const stakeMaxAmount = () => {
    setStakeAmount(sDaoBalance.toString());
  };

  const onInputStakeChange = (event: any) => {
    const value = event.target.value;
    if (value > sDaoBalance) {
      if (errors.length < 1) {
        setErrors(
          errors.concat([`You cannot stake more than ${sDaoBalance} sDAO`])
        );
      }
      setIsStakeButtonDisabled(true);
    } else {
      setErrors([]);
      setIsStakeButtonDisabled(false);
    }
    setStakeAmount(value);
  };

  const stake = async () => {
    const amount = uintCV(Number((parseFloat(stakeAmount) * 1000000).toFixed(0)));
    console.log()
    const postConditions = [
      createFungiblePostCondition(
        stxAddress!,
        FungibleConditionCode.LessEqual,
        amount.value,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'sdao-token',
          'sdao'
        )
      )
    ];
    
    await doContractCall({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'staking-v1',
      functionName: 'stake',
      functionArgs: [
        contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'sdao-token'),
        amount
      ],
      postConditions,
      network: stacksNetwork,
      onFinish: async data => {
        setCurrentTxId(data.txId);
        setCurrentTxStatus('pending');
        setShowStakeModal(false);
      }
    });
  };

  return (
    <Modal
      open={showStakeModal}
      title="Stake sDAO"
      icon={<img className="w-10 h-10 rounded-full" src="/sdao-logo.jpg" alt="sDAO logo" />}
      closeModal={() => setShowStakeModal(false)}
      buttonText="Stake"
      buttonAction={() => stake()}
      buttonDisabled={isStakeButtonDisabled || errors.length > 0}
      initialFocus={inputRef}
    >
      {errors.length > 0 ? (
        <div className="mb-4">
          <Alert type={Alert.type.ERROR}>
            <p>{errors[0]}</p>
          </Alert>
        </div>
      ) : null}

      <p className="mt-3 text-sm text-center text-gray-500">
        Stake sDAO tokens at {apy}% (estimated APR) and start earning rewards now.
      </p>
      <div className="mt-6">
        <InputAmount
          balance={sDaoBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
          token="sDAO"
          inputName="stakesDAO"
          inputId="stakeAmount"
          inputValue={stakeAmount}
          inputLabel="Stake sDAO"
          onInputChange={onInputStakeChange}
          onClickMax={stakeMaxAmount}
          ref={inputRef}
        />
      </div>
    </Modal>
  );
};
