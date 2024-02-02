import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "../wrappers/tests-utils.ts";

import { StackingDelegate } from '../wrappers/stacking-delegate-helpers.ts';
import { StackingPool } from '../wrappers/stacking-pool-helpers.ts';


//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "stacking-pool: ",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);


    let block = chain.mineBlock([
      Tx.transferSTX(150000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);


    let result = await stackingDelegate.revokeAndDelegate(deployer, 150000, qualifiedName("stacking-pool-v1"), 99999999);
    result.expectOk().expectBool(true);

    let call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(150000);
    call.result.expectTuple()["unlock-height"].expectUint(0);

    result = await stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);


    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(150000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(42);

    // TODO: wait for unlock & unlock

    // 

  }
});


//-------------------------------------
// Errors 
//-------------------------------------

//-------------------------------------
// Access 
//-------------------------------------
