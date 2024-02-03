import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "../wrappers/tests-utils.ts";

import { StackingDelegate } from '../wrappers/stacking-delegate-helpers.ts';
import { StackingPool } from '../wrappers/stacking-pool-helpers.ts';

import { StrategyV3, StrategyV3InflowV1, StrategyV3AlgoV1 } from '../wrappers/strategy-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "strategy-v3: ",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);
    let strategyInflow = new StrategyV3InflowV1(chain, deployer)
    let strategyV3AlgoV1 = new StrategyV3AlgoV1(chain, deployer)
    let strategyV3 = new StrategyV3(chain, deployer)


    let block = chain.mineBlock([
      Tx.transferSTX(150000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);


    let result = await strategyV3.preparePools(deployer);
    result.expectOk().expectBool(true);

    result = await strategyV3.prepareDelegates(deployer, qualifiedName("stacking-pool-v1"));
    result.expectOk().expectBool(true);

    result = await strategyV3.prepareDelegates(deployer, qualifiedName("pox-fast-pool-v2-mock"));
    result.expectOk().expectBool(true);


    result = await strategyV3.execute(
      deployer, 
      qualifiedName("stacking-pool-v1"),
      [qualifiedName("stacking-delegate-1-1"), qualifiedName("stacking-delegate-1-2"), qualifiedName("stacking-delegate-1-3")]
    );
    result.expectOk().expectBool(true);

    // let call = await strategyV3AlgoV1.calculateLowestCombination(38000, [65000, 26000, 19500, 13000, 6500, 65000, 26000, 19500, 13000, 6500, 65000, 26000, 19500, 13000, 6500, 65000, 26000, 19500, 13000, 6500, 65000, 26000, 19500, 13000, 6500, 65000, 26000, 19500, 13000, 6500]);
    // call.result.expectOk().expectBool(true);



    // let call = await strategyV3AlgoV1.calculateReachTarget(
    //   [120000, 210000, 230000, 130000, 90000],
    //   [210000, 110000, 180000, 130000, 120000]
    // );
    // call.result.expectOk().expectBool(true);



    // let block = chain.mineBlock([
    //   Tx.transferSTX(150000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    // ]);
    // block.receipts[0].result.expectOk().expectBool(true);


    // let result = await stackingDelegate.revokeAndDelegate(deployer, 150000, qualifiedName("stacking-pool-v1"), 99999999);
    // result.expectOk().expectBool(true);

    // let call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    // call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    // call.result.expectTuple()["unlocked"].expectUintWithDecimals(150000);
    // call.result.expectTuple()["unlock-height"].expectUint(0);

    // result = await stackingPool.prepare(deployer);
    // result.expectOk().expectBool(true);


    // call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    // call.result.expectTuple()["locked"].expectUintWithDecimals(150000);
    // call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    // call.result.expectTuple()["unlock-height"].expectUint(42);

    // // TODO: wait for unlock & unlock

    // // 


    // block = chain.mineBlock([
    //   Tx.transferSTX(20000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    // ]);
    // block.receipts[0].result.expectOk().expectBool(true);

    // // stacking-pool-v1 has already locked 150k
    // // There is now an extra pool, and extra inflow of 20k
    // // Targets are 70% and 30% for new pool. New pool target is 30% * 170k = 51k
    // // So first pool has overlocked, and can only add the idle 20k to new pool

    // call = await strategyInflow.getNewStacking();
    // call.result.expectList()[0].expectTuple()["new-stacking"].expectUintWithDecimals(150000);
    // call.result.expectList()[0].expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"));
    // call.result.expectList()[1].expectTuple()["new-stacking"].expectUintWithDecimals(20000);
    // call.result.expectList()[1].expectTuple()["pool"].expectPrincipal(qualifiedName("pox-fast-pool-v2-mock"));
  }
});


//-------------------------------------
// Errors 
//-------------------------------------

//-------------------------------------
// Access 
//-------------------------------------
