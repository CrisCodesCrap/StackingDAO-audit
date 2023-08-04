import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet/index.ts";

import { StickyCore } from './helpers/sticky-core-helpers.ts';
import { qualifiedName } from './helpers/sticky-tests-utils.ts';
qualifiedName("");

Clarinet.test({
  name: "core: test STX to stSTX ratio",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;
    let wallet_3 = accounts.get("wallet_3")!;

    let stickyCore = new StickyCore(chain, deployer);

    // Set commission to 0 so it does not influence STX per stSTX
    let result = await stickyCore.setCommission(deployer, 0);
    result.expectOk().expectBool(true);

    // Deposit 1000 STX
    result = await stickyCore.deposit(deployer, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    // Deposit 2000 STX
    result = await stickyCore.deposit(wallet_1, 2000);
    result.expectOk().expectUintWithDecimals(2000);

    // STX to stSTX ratio remains 1
    let call = await stickyCore.getStxPerStstx();
    call.result.expectOk().expectUintWithDecimals(1);

    // Add 100 STX as rewards
    result = await stickyCore.addRewards(wallet_2, 100, 0);
    result.expectOk().expectUintWithDecimals(100);

    // STX to stSTX ratio increased
    // There are now 3100 STX in pool, for 3000 stSTX in supply
    // 3100/3000=1.0033333
    call = await stickyCore.getStxPerStstx();
    call.result.expectOk().expectUintWithDecimals(1.033333);

    // Deposit 1000 STX
    // 1000*1.0033333=967.742247
    result = await stickyCore.deposit(wallet_2, 1000);
    result.expectOk().expectUintWithDecimals(967.742247);

    // Deposit 2000 STX
    result = await stickyCore.deposit(wallet_3, 2000);
    result.expectOk().expectUintWithDecimals(1935.484495);

    // After deposits, STX to stSTX did not change
    call = await stickyCore.getStxPerStstx();
    call.result.expectOk().expectUintWithDecimals(1.033333);

    // Add 200 STX as rewards
    result = await stickyCore.addRewards(wallet_2, 200, 0);
    result.expectOk().expectUintWithDecimals(200);

    // There is now 6300 STX in pool, 5903 stSTX in supply
    // 6300/5903=1.067212
    call = await stickyCore.getStxPerStstx();
    call.result.expectOk().expectUintWithDecimals(1.067212);

    // Withdraw 1000 stSTX tokens
    result = await stickyCore.initWithdraw(deployer, 1000, 1);
    result.expectOk().expectUintWithDecimals(1000);

    // Advance to next cycle
    chain.mineEmptyBlock(2001);

    // 1000 stSTX * 1.067212 = 1067.212 STX
    result = stickyCore.withdraw(deployer, 1);
    result.expectOk().expectUintWithDecimals(1067.212);
  },
});

Clarinet.test({
  name: "core: test deposit, STX to stSTX ratio and withdrawals",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyCore = new StickyCore(chain, deployer);

    // Set commission to 0 so it does not influence STX per stSTX
    let result = await stickyCore.setCommission(deployer, 0);
    result.expectOk().expectBool(true);

    // Deposit 1,000,000 STX
    result = await stickyCore.deposit(deployer, 1000000);
    result.expectOk().expectUintWithDecimals(1000000);

    // Got 1,000,000 stSTX
    let call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
      types.principal(deployer.address),
    ], wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(1000000);

    // Advance to next cycle
    chain.mineEmptyBlock(2101);

    // Add rewards
    result = await stickyCore.addRewards(wallet_2, 10000, 0);
    result.expectOk().expectUintWithDecimals(10000);

    // STX per stSTX ratio increased
    call = await stickyCore.getStxPerStstx();
    call.result.expectOk().expectUintWithDecimals(1.01);

    // Deposit 1M STX
    result = await stickyCore.deposit(wallet_1, 1000000);
    result.expectOk().expectUintWithDecimals(990099.0099);

    // Advance to next cycle
    chain.mineEmptyBlock(2101);

    // Add rewards
    result = await stickyCore.addRewards(wallet_2, 18000, 1);
    result.expectOk().expectUintWithDecimals(18000);

    // Now let's see what the stSTX to STX ratio is
    call = await stickyCore.getStxPerStstx();
    call.result.expectOk().expectUintWithDecimals(1.019044); 

    // Let's test withdrawals
    // We are in cycle 4, so cycle 5 is the first we can withdraw (hence u5 as second param)
    result = await stickyCore.initWithdraw(deployer, 1000000, 5);
    result.expectOk().expectUintWithDecimals(1000000);

    // Deployer should have 0 stSTX left
    call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
      types.principal(deployer.address),
    ], wallet_1.address);
    call.result.expectOk().expectUint(0);

    // Deployer did not get STX back
    call = await stickyCore.getStxBalance(deployer.address);
    call.result.expectUintWithDecimals(99000000); // 99M

    // Let's go 1 cycle further now
    chain.mineEmptyBlock(2001);

    // Withdraw
    result = stickyCore.withdraw(deployer, 5);
    result.expectOk().expectUintWithDecimals(1019044);

    // STX balance
    call = stickyCore.getStxBalance(deployer.address);
    call.result.expectUintWithDecimals(100019044);

    // After deployer pulled all their capital + rewards, the ratio remains the same
    call = await stickyCore.getStxPerStstx();
    call.result.expectOk().expectUintWithDecimals(1.019045);
  },
});
