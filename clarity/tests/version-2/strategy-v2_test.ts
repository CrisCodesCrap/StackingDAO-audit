import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName, REWARD_CYCLE_LENGTH } from "../wrappers/tests-utils.ts";

import { StrategyV2 } from '../wrappers/strategy-helpers.ts';
import { Reserve } from '../wrappers/reserve-helpers.ts';
import { StackingPool } from '../wrappers/stacking-pool-helpers.ts';
import { Pox4Mock } from '../wrappers/pox-mock-helpers.ts';

//-------------------------------------
// Strategy V2
//-------------------------------------

Clarinet.test({
  name: "strategy-v2: calculate outflow/inflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV2 = new StrategyV2(chain, deployer)
    let stackingPool = new StackingPool(chain, deployer);
    let reserve = new Reserve(chain, deployer);
    await stackingPool.addSignatures(chain, deployer);

    // 150k STX to reserve
    let block = chain.mineBlock([
      Tx.transferSTX(150000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    //
    // Inflow
    //

    let call = await strategyV2.getInflowOutflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(150000);
    call.result.expectTuple()["total-stacking"].expectUintWithDecimals(0);
    call.result.expectTuple()["total-idle"].expectUintWithDecimals(150000);
    call.result.expectTuple()["total-withdrawals"].expectUintWithDecimals(0);


    //
    // Stack
    //

    let result = strategyV2.performPoolDelegation(deployer, qualifiedName("stacking-pool-v1"), [
      { delegate: qualifiedName("stacking-delegate-1-1"), amount: 100000 },
      { delegate: qualifiedName("stacking-delegate-1-2"), amount: 30000 },
      { delegate: qualifiedName("stacking-delegate-1-3"), amount: 20000 }
    ])
    result.expectOk().expectBool(true);

    chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH - 3)

    result = stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);

    //
    // Outflow
    //

    reserve.lockStxForWithdrawal(deployer, 20000);
    result.expectOk().expectBool(true);

    call = await strategyV2.getInflowOutflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(20000);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["total-stacking"].expectUintWithDecimals(150000);
    call.result.expectTuple()["total-idle"].expectUintWithDecimals(0);
    call.result.expectTuple()["total-withdrawals"].expectUintWithDecimals(20000);
  }
});

Clarinet.test({
  name: "strategy-v2: perform delegation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV2 = new StrategyV2(chain, deployer)
    let pox = new Pox4Mock(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);
    await stackingPool.addSignatures(chain, deployer);

    // 300k STX to reserve
    let block = chain.mineBlock([
      Tx.transferSTX(300000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    
    //
    // Perform delegation
    //
    let result = strategyV2.performPoolDelegation(deployer, qualifiedName("stacking-pool-v1"), [
      { delegate: qualifiedName("stacking-delegate-1-1"), amount: 100000 },
      { delegate: qualifiedName("stacking-delegate-1-2"), amount: 30000 },
      { delegate: qualifiedName("stacking-delegate-1-3"), amount: 20000 }
    ])
    result.expectOk().expectBool(true);

    let call = await pox.getCheckDelegation(qualifiedName("stacking-delegate-1-1"));
    call.result.expectSome().expectTuple()["amount-ustx"].expectUintWithDecimals(100000);
    call.result.expectSome().expectTuple()["delegated-to"].expectPrincipal(qualifiedName("stacking-pool-v1"));
    call.result.expectSome().expectTuple()["until-burn-ht"].expectSome().expectUint(REWARD_CYCLE_LENGTH * 2);

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(100000);
    call.result.expectTuple()["unlock-height"].expectUint(0);

    //
    // Prepare pool
    //

    chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH - 3)

    result = stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(100000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 2);

    //
    // Perform delegation
    //

    chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH + 3)

    // Inflow, outflow and same
    result = strategyV2.performPoolDelegation(deployer, qualifiedName("stacking-pool-v1"), [
      { delegate: qualifiedName("stacking-delegate-1-1"), amount: 130000 },
      { delegate: qualifiedName("stacking-delegate-1-2"), amount: 0 },
      { delegate: qualifiedName("stacking-delegate-1-3"), amount: 20000 }
    ])
    result.expectOk().expectBool(true);

    call = await pox.getCheckDelegation(qualifiedName("stacking-delegate-1-1"));
    call.result.expectSome().expectTuple()["amount-ustx"].expectUintWithDecimals(130000);
    call.result.expectSome().expectTuple()["delegated-to"].expectPrincipal(qualifiedName("stacking-pool-v1"));
    call.result.expectSome().expectTuple()["until-burn-ht"].expectSome().expectUint(REWARD_CYCLE_LENGTH * 3);

    call = await pox.getCheckDelegation(qualifiedName("stacking-delegate-1-2"));
    call.result.expectNone();

    call = await pox.getCheckDelegation(qualifiedName("stacking-delegate-1-3"));
    call.result.expectSome().expectTuple()["amount-ustx"].expectUintWithDecimals(20000);
    call.result.expectSome().expectTuple()["delegated-to"].expectPrincipal(qualifiedName("stacking-pool-v1"));
    call.result.expectSome().expectTuple()["until-burn-ht"].expectSome().expectUint(REWARD_CYCLE_LENGTH * 3);

    //
    // Prepare pool
    //

    chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH * 2 - 3)

    result = stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);

    chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH * 2 + 3)

    // Manually unlock
    pox.unlock(deployer, qualifiedName("stacking-delegate-1-2"))

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(130000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-2"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(30000);
    call.result.expectTuple()["unlock-height"].expectUint(0);

    call = await stackingPool.getStxAccount(qualifiedName("stacking-delegate-1-3"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(20000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);
  }
});
