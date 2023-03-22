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
  name: "core: test deposit, STX to stSTX ratio and withdrawals",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    // types.principal(Utils.qualifiedName(tokenX)),
    let block = chain.mineBlock([
      Tx.contractCall("sticky-core", "deposit", [
        types.uint(1000000 * 1000000),
      ], deployer.address),
    ]);
    let result = block.receipts[0].result;
    result.expectOk().expectBool(true);

    // Check STX to stSTX ratio
    let call = await chain.callReadOnlyFn("sticky-core", "stx-per-ststx", [], wallet_1.address);
    call.result.expectUint(1000000); // This means you can trade 1 STX for 1 stSTX

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
      ], wallet_2.address),
    ]);
    result = block.receipts[0].result;
    call = await chain.callReadOnlyFn("sticky-core", "get-total-rewards", [], wallet_1.address);
    call.result.expectUint(9500000000); // 10K STX minus 500 STX commission (5%)

    // Now let's see what the stSTX to STX ratio is
    call = await chain.callReadOnlyFn("sticky-core", "stx-per-ststx", [], wallet_1.address);
    call.result.expectUint(1009500); // This means you can trade 1.095 STX for 1 stSTX

    block = chain.mineBlock([
      Tx.contractCall("sticky-core", "deposit", [
        types.uint(1000000 * 1000000), // 1M STX
      ], wallet_1.address),
    ]);
    result = block.receipts[0].result;
    result.expectOk().expectBool(true);

    call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
      types.principal(wallet_1.address),
    ], wallet_1.address);
    call.result.expectOk().expectUint(995272455834); // Depositing 1M STX gives you 995K stSTX

    // Now imagine 2M STX is stacking (1M from deployer and 1M from wallet_1)
    // Rewards go to 18K STX per cycle (as an example)
    chain.mineEmptyBlock(2101);
    block = chain.mineBlock([
      Tx.contractCall("sticky-core", "add-rewards", [
        types.uint(18000 * 1000000),
      ], wallet_2.address),
    ]);
    result = block.receipts[0].result;
    call = await chain.callReadOnlyFn("sticky-core", "get-total-rewards", [], wallet_1.address);
    call.result.expectUint(26600000000); // 28K STX in total rewards with 1440 STX commission as part of it

    // Now you get 1.0133 STX for 1 stSTX
    call = await chain.callReadOnlyFn("sticky-core", "stx-per-ststx", [], wallet_1.address);
    call.result.expectUint(1013300);

    // Let's test withdrawals
    // A withdrawal can be applied for and then you need to wait 1 cycle (~2100 blocks) for it to unlock
    // We are in cycle 4, so cycle 5 is the first we can withdraw (hence u5 as second param)
    block = chain.mineBlock([
      Tx.contractCall("sticky-core", "init-withdraw", [
        types.uint(1000000 * 1000000), // 1M stSTX of deployer
        types.uint(5)
      ], deployer.address),
    ]);
    result = block.receipts[0].result;
    result.expectOk().expectBool(true);

    // Deployer should have 0 stSTX left
    call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
      types.principal(deployer.address),
    ], wallet_1.address);
    call.result.expectOk().expectUint(0);

    call = await chain.callReadOnlyFn("sticky-core", "get-stx-balance", [types.principal(deployer.address)], wallet_1.address);
    call.result.expectUint(99000000000000); // 99M

    // Let's go 1 cycle further now
    chain.mineEmptyBlock(2001);
    block = chain.mineBlock([
      Tx.contractCall("sticky-core", "withdraw", [], deployer.address),
    ]);
    console.log(block.receipts[0]);
    result = block.receipts[0].result;
    result.expectOk().expectBool(true);

    call = await chain.callReadOnlyFn("sticky-core", "get-stx-balance", [types.principal(deployer.address)], wallet_1.address);
    call.result.expectUint(100013300000000); // 100M + 13.3K STX (so 13.3K STX yield was earned)

    // After deployer pulled all their capital + rewards, stSTX backing stays the same at 1.0133 STX per stSTX
    // That means the claimable rewards for wallet_1 should be still be u995272455834 * u1013300 / u1000000
    call = await chain.callReadOnlyFn("sticky-core", "stx-per-ststx", [], wallet_1.address);
    call.result.expectUint(1013300);
  },
});
