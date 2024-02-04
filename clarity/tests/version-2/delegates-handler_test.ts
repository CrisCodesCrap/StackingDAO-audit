import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "../wrappers/tests-utils.ts";

import { DelegatesHandler } from '../wrappers/delegates-handler-helper.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "delegates-handler: ",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let delegatesHandler = new DelegatesHandler(chain, deployer);

    let block = chain.mineBlock([
      Tx.transferSTX(100 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Delegate
    let result = await delegatesHandler.revokeAndDelegate(deployer, qualifiedName("stacking-delegate-1-1"), 100, qualifiedName("stacking-pool-v1"), 99999999);
    result.expectOk().expectBool(true);

    let call = await delegatesHandler.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(100);

    // Add extra STX (= rewards)
    block = chain.mineBlock([
      Tx.transferSTX(10 * 1000000, qualifiedName("stacking-delegate-1-1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    call = await delegatesHandler.calculateRewards(qualifiedName("stacking-delegate-1-1"));
    call.result.expectUintWithDecimals(10);

    call = await delegatesHandler.calculateExcess(qualifiedName("stacking-delegate-1-1"));
    call.result.expectUintWithDecimals(0);

    // Revoke
    result = await delegatesHandler.revoke(deployer, qualifiedName("stacking-delegate-1-1"));
    result.expectOk().expectBool(true);

    call = await delegatesHandler.calculateRewards(qualifiedName("stacking-delegate-1-1"));
    call.result.expectUintWithDecimals(0);

    call = await delegatesHandler.calculateExcess(qualifiedName("stacking-delegate-1-1"));
    call.result.expectUintWithDecimals(0);
  }
});


//-------------------------------------
// Errors 
//-------------------------------------

//-------------------------------------
// Access 
//-------------------------------------
