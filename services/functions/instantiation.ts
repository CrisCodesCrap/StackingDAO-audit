import { nextWalletsPage, snapshotWallets } from "@/packages/db/actions";
import { WalletSnapshot } from "@/packages/db/models";
import { getAddressesStSTXBalance } from "@/packages/stacks/accounts";

/*
This script is meant to be used to get the snapshot stSTX balance
for every address we have in our database and save it to our
database to use for calculations later on.
*/
async function snapshot(block_hash: string) {
    console.log(
        "snapshotting known wallets stSTX balance at block",
        block_hash,
    );
    const pageSize = 50; // Set the page size for each query
    let cursor: { address: string; createdAt: Date } | undefined = undefined;

    while (true) {
        // Call nextWalletsPage with the cursor and page size
        const page = await nextWalletsPage(cursor, pageSize);

        // If the page is empty, break out of the loop
        if (page.length === 0) break;

        const addresses = page.map((record) => record.address);

        const wallets = await getAddressesStSTXBalance(block_hash, addresses);

        console.log(
            `stSTX balances found: ${wallets.length}/${addresses.length}`,
        );
        if (wallets.length == 0) continue;

        const snapshot = wallets.map<WalletSnapshot>((value) => ({
            ...value,
            snapshotBalance: value.currentBalance,
        }));

        // 4. Write new wallets to db.
        const recordsWritten = await snapshotWallets(block_hash, snapshot);

        console.log(`Updated or created ${recordsWritten} wallets`);

        // Optimistic: If the page is the last one, break out of the loop
        if (page.length < pageSize) break;

        // Update the cursor to the last element of the page
        cursor = {
            address: page[page.length - 1].address,
            createdAt: page[page.length - 1].createdAt,
        };
    }
}

snapshot("0x6e5babd3ddcc00391c9445423643e9c561e7b1c49a3d49e8ed43390d6e99fd52");
