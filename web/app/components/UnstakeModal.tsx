import React, { useContext, useState, useRef } from 'react';
import { Modal } from './Modal';
import { InputAmount } from './InputAmount';
import { stacksNetwork as network } from '../common/utils';
import { Alert } from './Alert';
import { useAppContext } from './AppContext'
import { useAccount, useOpenContractCall } from '@micro-stacks/react'

export const UnstakeModal = ({ showUnstakeModal, setShowUnstakeModal, stakedAmount }) => {
  const { stxAddress } = useAccount();
  const { openContractCall } = useOpenContractCall();

  const [errors, setErrors] = useState<string[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isUnstakeButtonDisabled, setIsUnstakeButtonDisabled] = useState(false);
  const contractAddress = process.env.NEXT_PUBLIC_STSTX_ADDRESS || '';
  const inputRef = useRef<HTMLInputElement>(null);
  const { stDaoBalance, setCurrentTxId, setCurrentTxStatus } = useAppContext();

  const unstake = async () => {
    const amount = uintCV(Number((parseFloat(stakeAmount) * 1000000).toFixed(0)));
    const postConditions = [
      makeStandardFungiblePostCondition(
        stxAddress || '',
        FungibleConditionCode.LessEqual,
        amount.value,
        createAssetInfo(contractAddress, 'stdao-token', 'stdao')
      ),
    ];

    await doContractCall({
      network,
      contractAddress,
      stxAddress,
      contractName: 'staking-v1',
      functionName: 'unstake',
      functionArgs: [
        contractPrincipalCV(contractAddress, 'stdao-token'),
        amount,
      ],
      postConditionMode: 0x01,
      onFinish: data => {
        console.log('finished broadcasting unstaking tx!', data);
        setCurrentTxId(data.txId);
        setCurrentTxStatus('pending');
        setShowUnstakeModal(false);
      },
      anchorMode: AnchorMode.Any,
    });
  };

  const unstakeMaxAmount = () => {
    setStakeAmount(stDaoBalance / 1000000);
  };

  const onInputStakeChange = (event: any) => {
    const value = event.target.value;
    // trying to unstake
    if (value > stDaoBalance / 1000000) {
      if (errors.length < 1) {
        setErrors(errors.concat(['You cannot unstake more than currently staking']));
      }
      setIsUnstakeButtonDisabled(true);
    } else {
      setErrors([]);
      setIsUnstakeButtonDisabled(false);
    }
    setStakeAmount(value);
  };

  return (
    <Modal
      open={showUnstakeModal}
      title="Unstake STDAO"
      icon={<img className="w-10 h-10 rounded-full" src="./stdao-logo.jpg" alt="STDAO logo" />}
      closeModal={() => setShowUnstakeModal(false)}
      buttonText="Unstake"
      buttonAction={() => unstake()}
      buttonDisabled={isUnstakeButtonDisabled || errors.length > 0}
      initialFocus={inputRef}
    >
      {errors.length > 0 ? (
        <div className="mb-4">
          <Alert type={Alert.type.ERROR}>
            {errors.map(txt => (
              <p key={txt}>{txt}</p>
            ))}
          </Alert>
        </div>
      ) : null}

      <p className="mt-3 text-sm text-center text-gray-500 dark:text-zinc-400">
        You are currently staking{' '}
        {stakedAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}{' '}
        STDAO
      </p>
      <div className="mt-6">
        <InputAmount
          balance={stakedAmount.toLocaleString()}
          token="STDAO"
          inputName="unstakeSTDAO"
          inputId="unstakeAmount"
          inputValue={stakeAmount}
          inputLabel="Unstake STDAO"
          onInputChange={onInputStakeChange}
          onClickMax={unstakeMaxAmount}
          ref={inputRef}
        />
      </div>
    </Modal>
  );
};
