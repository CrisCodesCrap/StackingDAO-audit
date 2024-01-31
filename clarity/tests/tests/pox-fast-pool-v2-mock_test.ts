import { Account, Chain, Clarinet, Tx, type } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "../wrappers/tests-utils.ts";
qualifiedName("")

import { FastPoolV2 } from '../wrappers/pox-fast-pool-v2-helpers.ts';
import { StackingDelegate } from '../wrappers/stacking-delegate-helpers.ts';
import { StackingPool } from '../wrappers/stacking-pool-helpers.ts';


//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "fast-pool-v2: ",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let fastPool = new FastPoolV2(chain, deployer);
    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);


    await chain.mineEmptyBlockUntil(21);


    let call = await stackingPool.getPoxInfo();
    console.log("Block:", chain.blockHeight);
    console.log("PoX Info:", call.result);

    // Commit failed (min not reached?)
    // Keeps 1 STX
    // Locked for ??
    let result = await fastPool.delegateStx(deployer, 1000);
    result.expectOk().expectTuple()["commit-result"].expectBool(false);
    result.expectOk().expectTuple()["lock-result"].expectTuple()["lock-amount"].expectUintWithDecimals(1000 - 1);
    result.expectOk().expectTuple()["lock-result"].expectTuple()["stacker"].expectPrincipal(deployer.address);
    result.expectOk().expectTuple()["lock-result"].expectTuple()["unlock-burn-height"].expectUint(63);

    result = await fastPool.delegateStx(wallet_1, 120000);
    result.expectOk().expectTuple()["commit-result"].expectBool(true);
    result.expectOk().expectTuple()["lock-result"].expectTuple()["lock-amount"].expectUintWithDecimals(120000 - 1);
    result.expectOk().expectTuple()["lock-result"].expectTuple()["stacker"].expectPrincipal(wallet_1.address);
    result.expectOk().expectTuple()["lock-result"].expectTuple()["unlock-burn-height"].expectUint(63);


    call = await stackingDelegate.getStxAccount(deployer.address);
    call.result.expectTuple()["locked"].expectUintWithDecimals(999);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(99999001);
    call.result.expectTuple()["unlock-height"].expectUint(63);


    await chain.mineEmptyBlockUntil(21 + 15);

    result = await fastPool.delegateStackStx(deployer, deployer.address);
    result.expectOk().expectBool(true);

  }
});

//-------------------------------------
// Errors 
//-------------------------------------

//-------------------------------------
// Access 
//-------------------------------------
