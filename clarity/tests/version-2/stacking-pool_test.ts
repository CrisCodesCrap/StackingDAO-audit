import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { hexToBytes, qualifiedName } from "../wrappers/tests-utils.ts";

import { StackingDelegate } from '../wrappers/stacking-delegate-helpers.ts';
import { StackingPool } from '../wrappers/stacking-pool-helpers.ts';
import { Pox4Mock } from '../wrappers/pox-mock-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "stacking-pool: prepare",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);

    //
    // 500k STX to delegate-1-1
    //

    let block = chain.mineBlock([
      Tx.transferSTX(500000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let result = stackingDelegate.requestStxToStack(deployer, "stacking-delegate-1-1", 500000);
    result.expectOk().expectUintWithDecimals(500000);

    let call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"))
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(500000);
    call.result.expectTuple()["unlock-height"].expectUint(0);

    //
    // Delegate 200k
    //

    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    result = stackingPool.prepare(wallet_1);
    result.expectOk().expectBool(true);

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"))
    call.result.expectTuple()["locked"].expectUintWithDecimals(200000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(500000 - 200000);
    call.result.expectTuple()["unlock-height"].expectUint(42);

    call = await stackingPool.totalDelegated();
    call.result.expectUintWithDecimals(200000);
    call = await stackingPool.totalDelegatedHelper(qualifiedName("stacking-delegate-1-1"));
    call.result.expectUintWithDecimals(200000);

    //
    // Prepare again
    //

    result = stackingDelegate.revokeDelegateStx(deployer, "stacking-delegate-1-1");
    result.expectOk().expectBool(true);
    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 250000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    call = await stackingPool.getCycleToIndex(1);
    call.result.expectSome().expectUint(0);

    result = stackingPool.prepare(wallet_1);
    result.expectOk().expectBool(true);

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"))
    call.result.expectTuple()["locked"].expectUintWithDecimals(250000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(500000 - 250000);
    call.result.expectTuple()["unlock-height"].expectUint(42);

    call = await stackingPool.totalDelegated();
    call.result.expectUintWithDecimals(250000);
    call = await stackingPool.totalDelegatedHelper(qualifiedName("stacking-delegate-1-1"));
    call.result.expectUintWithDecimals(250000);
  }
});

Clarinet.test({
  name: "stacking-pool: can prepare multiple times",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);

    //
    // 500k STX to delegate-1-1
    //

    let block = chain.mineBlock([
      Tx.transferSTX(1000000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let result = stackingDelegate.requestStxToStack(deployer, "stacking-delegate-1-1", 500000);
    result.expectOk().expectUintWithDecimals(500000);
    result = stackingDelegate.requestStxToStack(deployer, "stacking-delegate-1-2", 500000);
    result.expectOk().expectUintWithDecimals(500000);

    //
    // Delegate 200k & prepare pool
    //

    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    result = stackingPool.prepare(wallet_1);
    result.expectOk().expectBool(true);

    //
    // Prepare again - Need to have extra delegated
    //

    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-2", 10, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    result = stackingPool.prepare(wallet_1);
    result.expectOk().expectBool(true);

    //
    // Check data
    //

    let call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"))
    call.result.expectTuple()["locked"].expectUintWithDecimals(200000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(500000 - 200000);
    call.result.expectTuple()["unlock-height"].expectUint(42);

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-2"))
    call.result.expectTuple()["locked"].expectUintWithDecimals(10);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(500000 - 10);
    call.result.expectTuple()["unlock-height"].expectUint(42);
  }
});

Clarinet.test({
  name: "stacking-pool: use pox wrappers directly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);




  }
});

//-------------------------------------
// Admin 
//-------------------------------------

Clarinet.test({
  name: "stacking-pool: can set pox reward address",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);

    let call = await stackingPool.getPoxRewardAddress();
    call.result.expectTuple()["version"].expectBuff(hexToBytes("0x00"));
    call.result.expectTuple()["hashbytes"].expectBuff(hexToBytes("0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac"));

    let result = stackingPool.setPoxRewardAddress(deployer, "0x01", "0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ab");
    result.expectOk().expectBool(true);

    call = await stackingPool.getPoxRewardAddress();
    call.result.expectTuple()["version"].expectBuff(hexToBytes("0x01"));
    call.result.expectTuple()["hashbytes"].expectBuff(hexToBytes("0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ab"));
  }
});

//-------------------------------------
// Errors 
//-------------------------------------

// Call wrappers directly

//-------------------------------------
// PoX Errors 
//-------------------------------------


Clarinet.test({
  name: "stacking-pool: can not prepare if threshold not met",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);

    let block = chain.mineBlock([
      Tx.transferSTX(500000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let result = stackingDelegate.requestStxToStack(deployer, "stacking-delegate-1-1", 500000);
    result.expectOk().expectUintWithDecimals(500000);

    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 50000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    // ERR_STACKING_THRESHOLD_NOT_MET
    result = stackingPool.prepare(deployer);
    result.expectErr().expectUint(11);
  }
});

Clarinet.test({
  name: "stacking-pool: can not delegate again without revoking first",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);

    let block = chain.mineBlock([
      Tx.transferSTX(500000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let result = stackingDelegate.requestStxToStack(deployer, "stacking-delegate-1-1", 500000);
    result.expectOk().expectUintWithDecimals(500000);

    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 50000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    // ERR_STACKING_ALREADY_DELEGATED 
    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectErr().expectUint(20);

    // Revoke
    result = stackingDelegate.revokeDelegateStx(deployer,  "stacking-delegate-1-1");
    result.expectOk().expectBool(true);

    // Can delegate again
    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "stacking-pool: can not delegate again if already stacked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);

    let block = chain.mineBlock([
      Tx.transferSTX(500000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let result = stackingDelegate.requestStxToStack(deployer, "stacking-delegate-1-1", 500000);
    result.expectOk().expectUintWithDecimals(500000);

    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    result = stackingPool.delegateStackStx(deployer, qualifiedName("stacking-delegate-1-1"), 200000);
    result.expectOk().expectTuple()["lock-amount"].expectUintWithDecimals(200000);
    result.expectOk().expectTuple()["stacker"].expectPrincipal(qualifiedName("stacking-delegate-1-1"));
    result.expectOk().expectTuple()["unlock-burn-height"].expectUint(42);

    // ERR_STACKING_ALREADY_STACKED
    result = stackingPool.delegateStackStx(deployer, qualifiedName("stacking-delegate-1-1"), 200000);
    result.expectErr().expectUint(3);

    // Revoke
    result = stackingDelegate.revokeDelegateStx(deployer,  "stacking-delegate-1-1");
    result.expectOk().expectBool(true);

    // Can delegate again
    result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "stacking-pool: can not delegate without funds",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);

    let result = stackingDelegate.delegateStx(deployer, "stacking-delegate-1-1", 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    // ERR_STACKING_INSUFFICIENT_FUNDS
    result = stackingPool.delegateStackStx(deployer, qualifiedName("stacking-delegate-1-1"), 200000);
    result.expectErr().expectUint(1);
  }
});



// ERR_CAN_NOT_PREPARE


//-------------------------------------
// Access 
//-------------------------------------

// PoX Wrappers & Admin
