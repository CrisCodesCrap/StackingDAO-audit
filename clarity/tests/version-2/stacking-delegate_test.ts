import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "../wrappers/tests-utils.ts";

import { StackingDelegate } from '../wrappers/stacking-delegate-helpers.ts';


//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "stacking-delegate: ",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);

    let block = chain.mineBlock([
      Tx.transferSTX(100 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let result = await stackingDelegate.revokeAndDelegate(deployer, 100, qualifiedName("stacking-pool-v1"), 99999999);
    result.expectOk().expectBool(true);

    let call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(100);


    block = chain.mineBlock([
      Tx.transferSTX(10 * 1000000, qualifiedName("stacking-delegate-1-1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    call = await stackingDelegate.calculateRewards();
    call.result.expectUintWithDecimals(10);

    call = await stackingDelegate.calculateExcess();
    call.result.expectUintWithDecimals(0);

    result = await stackingDelegate.revoke(deployer);
    result.expectOk().expectBool(true);

    call = await stackingDelegate.calculateRewards();
    call.result.expectUintWithDecimals(0);

    call = await stackingDelegate.calculateExcess();
    call.result.expectUintWithDecimals(0);
  }
});


//-------------------------------------
// Errors 
//-------------------------------------

//-------------------------------------
// Access 
//-------------------------------------
