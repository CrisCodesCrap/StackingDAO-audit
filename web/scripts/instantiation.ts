import { WalletSnapshot } from '@/db/models';
import { nextWalletsPage, snapshotWallets } from '@/backend/lib/db';
import { getAddressesStSTXBalance } from '@/backend/lib/stacks/accounts';

const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

/*
This script is meant to be used to get the snapshot stSTX balance
for every address we have in our database and save it to our
database to use for calculations later on.
*/
async function snapshot(block_hash: string) {
  console.log('snapshotting known wallets stSTX balance at block', block_hash);
  // const pageSize = 50; // Set the page size for each query
  const wallets = await nextWalletsPage();

  console.log(`found ${wallets.length} wallets`);

  let total = 0;
  for (const wallet of wallets) {
    const balances = await getAddressesStSTXBalance(block_hash, [wallet.address]);

    const snapshot = balances.map<WalletSnapshot>(value => ({
      ...value,
      snapshotBalance: value.currentBalance,
    }));

    // 4. Write new wallets to db.
    const recordsWritten = await snapshotWallets(block_hash, snapshot);
    total += recordsWritten;

    if (total % wallets.length == 0)
      console.log(`======== progress: ${total}/${wallets.length} ========`);
  }
}

snapshot('0x813e5b09c962905439fb21b5969e826b7a0f744f70ee80b2d7a8a00341d95f8c');
