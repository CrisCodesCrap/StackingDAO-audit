import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "../wrappers/tests-utils.ts";

import { StackingDelegate } from '../wrappers/stacking-delegate-helpers.ts';
import { StackingPool } from '../wrappers/stacking-pool-helpers.ts';

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

    let result = stackingDelegate.requestStxToStack(deployer, 500000);
    result.expectOk().expectUintWithDecimals(500000);

    let call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"))
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(500000);
    call.result.expectTuple()["unlock-height"].expectUint(0);

    //
    // Delegate 200k
    //

    result = stackingDelegate.delegateStx(deployer, 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    result = stackingPool.prepare(deployer);
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


    result = stackingDelegate.revokeDelegateStx(deployer);
    result.expectOk().expectBool(true);
    result = stackingDelegate.delegateStx(deployer, 250000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    call = await stackingPool.getCycleToIndex(1);
    call.result.expectSome().expectUint(0);

    result = stackingPool.prepare(deployer);
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

// ISSUE: error no such principal because delegation removed after previous prepare???
// Test with multiple delegates
Clarinet.test({
  name: "stacking-pool: can prepare multiple times",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);


    

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
  name: "stacking-pool: can set reward address",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);


    

  }
});

//-------------------------------------
// Errors 
//-------------------------------------

// ERR_CAN_NOT_PREPARE

Clarinet.test({
  name: "stacking-pool: pox errors",
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

    let result = stackingDelegate.requestStxToStack(deployer, 500000);
    result.expectOk().expectUintWithDecimals(500000);

    //
    // ERR_STACKING_THRESHOLD_NOT_MET
    //

    result = stackingDelegate.delegateStx(deployer, 50000, qualifiedName("stacking-pool-v1"), 42);
    result.expectOk().expectBool(true);

    let call = await stackingPool.totalDelegated();
    call.result.expectUintWithDecimals(50000);
    call = await stackingPool.totalDelegatedHelper(qualifiedName("stacking-delegate-1-1"));
    call.result.expectUintWithDecimals(50000);

    // ERR_STACKING_THRESHOLD_NOT_MET
    result = stackingPool.prepare(deployer);
    result.expectErr().expectUint(11);


    //
    // ERR_STACKING_ALREADY_DELEGATED
    //

    // ERR_STACKING_ALREADY_DELEGATED 
    result = stackingDelegate.delegateStx(deployer, 200000, qualifiedName("stacking-pool-v1"), 42);
    result.expectErr().expectUint(20);

    
  }
});

//-------------------------------------
// Access 
//-------------------------------------

// PoX Wrappers & Admin
