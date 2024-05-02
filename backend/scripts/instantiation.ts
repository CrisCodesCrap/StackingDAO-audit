import { WalletSnapshot } from '@repo/database/src/models';
import { nextWalletsPage, snapshotWallet } from '@repo/database/src/actions';
import { userInfoAtBlock } from '@repo/stacks/src/user_info';
import { BlocksApi } from '@stacks/blockchain-api-client';

// const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

const blocks = new BlocksApi();

/*
This script is meant to be used to get the snapshot stSTX balance
for every address we have in our database and save it to our
database to use for calculations later on.
*/
async function snapshot(block_height: number) {
  const block = await blocks.getBlock({ heightOrHash: block_height });
  console.log('snapshotting known wallets stSTX balance at block', block.hash);

  const wallets = await nextWalletsPage();

  console.log(`found ${wallets.length} wallets`);

  let total = 0;
  for (const wallet of wallets) {
    const balances = await userInfoAtBlock(wallet.address, block_height);
    const total_balance = Math.round(
      (balances.ststx_balance + balances.defi_balance + balances.lp_balance) * 1_000_000
    );

    console.log(
      `Updating account ${wallet.address} with balance ${total_balance} (ststx: ${balances.ststx_balance}, defi: ${balances.defi_balance}, lp: ${balances.lp_balance})`
    );

    const snapshot: WalletSnapshot = {
      address: wallet.address,
      currentBalance: total_balance.toString(),
      snapshotBalance: total_balance.toString(), // Comment this out if we need to update all balances without creating a snapshot
    };

    // 4. Write new wallets to db.
    const recordsWritten = await snapshotWallet(block.hash, snapshot);
    total += recordsWritten;

    if (total % wallets.length == 0)
      console.log(`======== progress: ${total}/${wallets.length} ========`);
  }
}

// snapshot('0x813e5b09c962905439fb21b5969e826b7a0f744f70ee80b2d7a8a00341d95f8c');
snapshot(147290);
