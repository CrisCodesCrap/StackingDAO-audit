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
        types.uint(1000000 * 1000000),
      ], deployer.address),
    ]);
    console.log(block.receipts[0]);
    let result = block.receipts[0].result;
    // console.log(result)

    // Check STX to stSTX ratio
    let call = await chain.callReadOnlyFn("sticky-core", "stx-per-ststx", [], wallet_1.address);
    console.log(call);


    call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
      types.principal(deployer.address),
    ], wallet_1.address);
    call.result.expectOk().expectUint(1000000000000); // 1M stSTX

    // Now imagine a stacking cycle ended and we got 10K STX yield
    // Advance 2100 blocks
    chain.mineEmptyBlock(2101);
    block = chain.mineBlock([
      Tx.contractCall("sticky-core", "add-rewards", [
        types.uint(10000 * 1000000),
      ], deployer.address),
    ]);
    console.log(block.receipts[0]);
    result = block.receipts[0].result;
    console.log(result);

    // Now let's see what the stSTX to STX ratio is
    call = await chain.callReadOnlyFn("sticky-core", "get-burn-height", [], wallet_1.address);
    console.log(call.result);
    call = await chain.callReadOnlyFn("sticky-core", "get-pox-cycle", [], wallet_1.address);
    console.log(call.result);
    call = await chain.callReadOnlyFn("sticky-core", "get-total-rewards", [], wallet_1.address);
    console.log(call.result);

    call = await chain.callReadOnlyFn("sticky-core", "stx-per-ststx", [], wallet_1.address);
    console.log(call);
    call.result.expectUint(1010000); // This means you can trade 1.01 STX for 1 stSTX
  },
});
