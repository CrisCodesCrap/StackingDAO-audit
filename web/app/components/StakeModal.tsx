import React, { useContext, useState, useRef } from 'react';
import { Modal } from './Modal';
import { InputAmount } from './InputAmount';
import { Alert } from './Alert';
import { stacksNetwork as network } from '../common/utils';
import { useAppContext } from './AppContext'
import { useAccount, useOpenContractCall } from '@micro-stacks/react'

interface Props {
  showStakeModal: boolean;
  setShowStakeModal: (arg: boolean) => void;
  apy: number;
}

export const StakeModal: React.FC<Props> = ({ showStakeModal, setShowStakeModal, apy }) => {
  const { stxAddress } = useAccount();
  const { openContractCall } = useOpenContractCall();

  const [errors, setErrors] = useState<string[]>([]);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [isStakeButtonDisabled, setIsStakeButtonDisabled] = useState(false);
  const contractAddress = process.env.NEXT_PUBLIC_STSTX_ADDRESS || '';
  const { stDaoBalance, setCurrentTxId, setCurrentTxStatus } = useAppContext();

  const inputRef = useRef<HTMLInputElement>(null);

  const stakeMaxAmount = () => {
    setStakeAmount((stDaoBalance / 1000000).toString());
  };

  const onInputStakeChange = (event: any) => {
    const value = event.target.value;
    if (value > stDaoBalance / 1000000) {
      if (errors.length < 1) {
        setErrors(
          errors.concat([`You cannot stake more than ${stDaoBalance / 1000000} STDAO`])
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
    const postConditions = [
      createFungiblePostCondition(
        stxAddress!,
        FungibleConditionCode.LessEqual,
        uintCV(amount).value,
        createAssetInfo(
          process.env.NEXT_PUBLIC_STSTX_ADDRESS,
          'stdao-token',
          'stdao'
        )
      )
    ];
    
    await openContractCall({
      contractAddress: process.env.NEXT_PUBLIC_STSTX_ADDRESS,
      contractName: 'staking-v1',
      functionName: 'stake',
      functionArgs: [
        contractPrincipalCV(`${process.env.NEXT_PUBLIC_STSTX_ADDRESS}`, 'stdao-token'),
        uintCV(stStxAmount)
      ],
      postConditions,
      onFinish: async data => {
        setCurrentTxId(data.txId);
        setCurrentTxStatus('pending');
      }
    });
  };

  return (
    <Modal
      open={showStakeModal}
      title="Stake STDAO"
      icon={<img className="w-10 h-10 rounded-full" src="/stdao-logo.jpg" alt="STDAO logo" />}
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

      <p className="mt-3 text-sm text-center text-gray-500 dark:text-zinc-400">
        Stake STDAO tokens at {apy}% (estimated APR) and start earning rewards now.
      </p>
      <div className="mt-6">
        <InputAmount
          balance={stDaoBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
          token="STDAO"
          inputName="stakeSTDAO"
          inputId="stakeAmount"
          inputValue={stakeAmount}
          inputLabel="Stake STDAO"
          onInputChange={onInputStakeChange}
          onClickMax={stakeMaxAmount}
          ref={inputRef}
        />
      </div>
    </Modal>
  );
};
