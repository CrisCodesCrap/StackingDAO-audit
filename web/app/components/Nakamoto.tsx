// @ts-nocheck

'use client'

import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import { box, randomBytes } from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';

export function Nakamoto({ bitflowLpWallet, bitflowLpStaked, bitflowLpWallet2, bitflowLpStaked2 }) {
  const { stxAddress, stStxBalance } = useAppContext();
  const [startedLoading, setStartedLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(true);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (startedLoading) return;

    setStartedLoading(true);
    const nakamotoVote = localStorage.getItem('nakamoto-voted');
    if (nakamotoVote === 'true') {
      setHasVoted(true);
    } else {
      setHasVoted(false);
    }
    setLoading(false);
  }, [])

  const accountId = '1K3sruN35m9wYyZuXUi6mdLMumv6piT9yf';
  const surveyId = 'e180135b-9653-44c9-9bfa-15a15dce3424';
  const publicKey = 'nHP1l7pfypzrBj3czLC6P2/s4+XJjlQaTQPdOA9FnmQ=';

  const newNonce = () => randomBytes(box.nonceLength);

  // Write a function to encrypt JSON
  const encryptJsonByTweetnacl = (sharedKey: Uint8Array, json: any, key?: Uint8Array) => {
    const nonce = newNonce();
    const messageUint8 = decodeUTF8(JSON.stringify(json));

    const encrypted = key
      ? box(messageUint8, nonce, key, sharedKey)
      : box.after(messageUint8, nonce, sharedKey);


    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);
    const base64FullMessage = encodeBase64(fullMessage);

    return base64FullMessage;
  }

  const submit = async (voteFor: boolean) => {
    setLoading(true);
    const answerObject = {
      "be9f7e1c-32bc-41b7-a35c-1961250f6f0c": voteFor,
      "e1c24594-8a5a-4a38-acea-bfa3685f3339": stxAddress,
      "0b47e281-a95d-4c4e-b326-496a4bb38b5b": stStxBalance,
      "2aae5c92-8fcf-4d5b-a6bb-ba015b29eb9b": bitflowLpWallet,
      "bf427bc5-55ce-42b8-9a6f-8950866bcbd4": bitflowLpStaked,
      "d1d88910-6579-47a7-ac8a-d64116a9ffe6": bitflowLpWallet2,
      "25505492-af63-46e2-aadf-f08a0bb56fce": bitflowLpStaked2
    };

    // Convert Survey's public key from Base64 to Uinit8Array
    const surveyPublicKeyUnit8Array = decodeBase64(publicKey);

    // Generate new pair of keys for each respondent
    const respondentKeyPair = box.keyPair();

    // Generate a shared key
    const sharedKey = box.before(surveyPublicKeyUnit8Array, respondentKeyPair.secretKey);

    // Encrypt the answerObject
    const encryptedAnswerObj = encryptJsonByTweetnacl(sharedKey, answerObject);

    // Final payload
    const finalPayload = {
      "qid": surveyId,
      "userId": accountId,
      "ans" : {
       "d": encryptedAnswerObj,
       "p": encodeBase64(respondentKeyPair.publicKey)
      }
    };

    // Send it to BlockSurvey API
    await fetch('https://api2.blocksurvey.io/api/blocksurvey/answer', {
      method: 'POST',
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
      },
      body: JSON.stringify(finalPayload)
    });

    setLoading(false);
    setHasVoted(true);
    localStorage.setItem('nakamoto-voted', 'true');
  }

  return (
    <>
      {stxAddress && (
        <div className="w-full flex flex-col gap-1 mt-10 mb-10">
          <span className="text-lg font-medium md:text-2xl">Nakamoto Hard Fork</span>
          <span className="text-md font-medium">Your vote will be weighted relative to your stSTX position. All votes are aggregated in the next 7 days.</span>
          <span className="text-md font-medium">The final result will be FOR or AGAINST, which StackingDAO will use to vote. See <a href="https://stx.eco">https://stx.eco</a> for more information.</span>

          {!hasVoted && !isLoading ? (
            <>
              <button
                type="button"
                className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg button-ststx text-white active:bg-button-active hover:bg-button-hover w-full mt-4`}
                onClick={() => submit(true)}
              >
                Vote FOR
              </button>

              <button
                type="button"
                className={`flex gap-2 items-center justify-center rounded-full px-6 font-bold focus:outline-none min-h-[48px] text-lg button-ststx text-white active:bg-button-active hover:bg-button-hover w-full mt-4`}
                onClick={() => submit(false)}
              >
                Vote AGAINST
              </button>
            </>
          ) : isLoading ? (
            <div role="status" className="flex text-center flex-col items-center mt-8">
              <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : hasVoted ? (
            <span className="text-2xl text-center mt-8 font-medium">Your vote has been saved successfully! Thanks for voting!</span>
          ) : null}
        </div>
      )}
    </>
  );
}
