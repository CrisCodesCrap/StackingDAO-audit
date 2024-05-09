'use server';

import { eq } from 'drizzle-orm';
import { Referral, NewReferral } from '../models';
import { referrals } from '../schema';
import { db } from '../drizzle';

export async function getReferralsForAddress(address: string): Promise<Referral[]> {
  return await db.select().from(referrals).where(eq(referrals.stacker, address));
}

export async function insertReferral(...newReferrals: NewReferral[]): Promise<number> {
  const result = await db
    .insert(referrals)
    .values(newReferrals)
    .onConflictDoNothing({ target: [referrals.referrer, referrals.stacker] });

  return result.rowCount;
}
