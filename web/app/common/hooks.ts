import { useLocalStorage } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useReferral(): string | null {
  const urlParam = useSearchParams().get('referral');

  const [referralV1, setReferralV1] = useState<string | null>();
  const [referralV2, setReferralV2] = useLocalStorage(
    'stacking-referral-v2',
    urlParam || referralV1
  );

  useEffect(() => {
    const storedRef = localStorage.getItem('stacking-referral');
    if (storedRef) {
      setReferralV1(storedRef);
      localStorage.removeItem('stacking-referral');
    }

    if (urlParam) setReferralV2(urlParam);
  }, []);

  return referralV2;
}
