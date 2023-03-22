import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet/index.ts";

import * as Utils from './models/sticky-tests-utils.ts';

const ststxTokenAddress = 'ststx-token';
const stickyTokenAddress = 'sticky-token';

Clarinet.test({
  name: "core: test deposit and STX to stSTX ratio",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // types.principal(Utils.qualifiedName(tokenX)),
    let block = chain.mineBlock([
      Tx.contractCall("sticky-core", "deposit", [
        types.uint(1 * 1000000),
      ], deployer.address),
    ]);
    console.log(block.receipts[0]);
    let result = block.receipts[0].result;
    console.log(result)

    // Check STX to stSTX ratio
    let call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
      types.principal(deployer.address),
    ], wallet_1.address);
    call.result.expectOk().expectUint(1000000); // 1 stSTX
  },
});
