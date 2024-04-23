import { AccountsApi, Configuration } from '@stacks/blockchain-api-client';
import { WalletUpdate as Balance } from '../../../db/models';
import { tokens } from './constants';

const config = new Configuration({
  basePath:
    'https://small-solemn-frost.stacks-mainnet.discover.quiknode.pro/deaf86bafdfbef850e40cdf5fa22c41cd447cdff',
});
const accounts = new AccountsApi(config);

export async function getAddressesStSTXBalance(
  block: string,
  addresses: string[]
): Promise<Balance[]> {
  try {
    const wallets: Balance[] = [];
    for (const address of addresses) {
      const data = await accounts.getAccountBalance({
        principal: address,
        untilBlock: block,
      });

      const ststx = data.fungible_tokens[tokens.ststx] as FungibleToken | undefined;

      wallets.push({
        address,
        currentBalance: ststx?.balance ?? '0.0',
        firstSeenAtBlock: block,
      });

      console.log(`Updating account ${address} with balance ${ststx?.balance}`);
    }

    return wallets;
  } catch (e) {
    console.error(e);
  }

  return [];
}

export interface FungibleToken {
  balance: string;
  total_sent: string;
  total_received: string;
}
