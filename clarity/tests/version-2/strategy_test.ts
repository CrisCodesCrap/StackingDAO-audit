import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName, REWARD_CYCLE_LENGTH } from "../wrappers/tests-utils.ts";

import { StackingDelegate } from '../wrappers/stacking-delegate-helpers.ts';
import { StrategyV3, StrategyV3PoolsV1, StrategyV3DelegatesV1, StrategyV3AlgoV1 } from '../wrappers/strategy-helpers.ts';
import { Reserve } from '../wrappers/reserve-helpers.ts';
import { StackingPool } from '../wrappers/stacking-pool-helpers.ts';
import { FastPoolV2 } from '../wrappers/pox-fast-pool-v2-helpers.ts';
import { Pox4Mock } from '../wrappers/pox-mock-helpers.ts';
import { DataDirectStacking } from '../wrappers/data-direct-stacking-helpers.ts';

//-------------------------------------
// Algo V1 
//-------------------------------------

Clarinet.test({
  name: "strategy-v3-algo-v1: calculate reach target",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV3AlgoV1 = new StrategyV3AlgoV1(chain, deployer)

    // Overall outflow
    let call = await strategyV3AlgoV1.calculateReachTarget(
      [147000, 63000],
      [175000, 75000]
    );
    call.result.expectList()[0].expectUintWithDecimals(147000);
    call.result.expectList()[1].expectUintWithDecimals(63000);

    // Overall inflow
    call = await strategyV3AlgoV1.calculateReachTarget(
      [120000, 210000, 230000, 130000, 90000],
      [210000, 110000, 180000, 130000, 120000]
    );
    call.result.expectList()[0].expectUintWithDecimals(210000);
    call.result.expectList()[1].expectUintWithDecimals(130000);
    call.result.expectList()[2].expectUintWithDecimals(190000);
    call.result.expectList()[3].expectUintWithDecimals(130000);
    call.result.expectList()[4].expectUintWithDecimals(120000);  // Outflow so stay at locked

    // Overall inflow
    call = await strategyV3AlgoV1.calculateReachTarget(
      [110000, 80000, 120000, 110000, 90000],
      [100000, 100000, 100000, 100000, 100000]
    );
    call.result.expectList()[0].expectUintWithDecimals(102500);
    call.result.expectList()[1].expectUintWithDecimals(100000); // Outflow so stay at locked
    call.result.expectList()[2].expectUintWithDecimals(105000);
    call.result.expectList()[3].expectUintWithDecimals(102500);
    call.result.expectList()[4].expectUintWithDecimals(100000); // Outflow so stay at locked

    // Overall outflow
    call = await strategyV3AlgoV1.calculateReachTarget(
      [80000, 70000, 130000, 110000, 90000],
      [100000, 100000, 100000, 100000, 100000]
    );
    call.result.expectList()[0].expectUintWithDecimals(93333.333334);
    call.result.expectList()[1].expectUintWithDecimals(90000);
    call.result.expectList()[2].expectUintWithDecimals(100000); // Inflow so stay at locked
    call.result.expectList()[3].expectUintWithDecimals(100000); // Inflow so stay at locked
    call.result.expectList()[4].expectUintWithDecimals(96666.666667);
  }
});

Clarinet.test({
  name: "strategy-v3-algo-v1: calculate lowest combination",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV3AlgoV1 = new StrategyV3AlgoV1(chain, deployer)

    // Stop 1
    let call = await strategyV3AlgoV1.calculateLowestCombination(19000, [65000, 26000, 19500, 11000, 6500]);
    call.result.expectList()[0].expectUintWithDecimals(65000);
    call.result.expectList()[1].expectUintWithDecimals(26000);
    call.result.expectList()[2].expectUintWithDecimals(0);
    call.result.expectList()[3].expectUintWithDecimals(11000);
    call.result.expectList()[4].expectUintWithDecimals(6500);

    // Stop at beginning
    call = await strategyV3AlgoV1.calculateLowestCombination(70000, [65000, 26000, 19500, 13000, 6500]);
    call.result.expectList()[0].expectUintWithDecimals(0);
    call.result.expectList()[1].expectUintWithDecimals(0);
    call.result.expectList()[2].expectUintWithDecimals(19500);
    call.result.expectList()[3].expectUintWithDecimals(13000);
    call.result.expectList()[4].expectUintWithDecimals(6500);

    // Stop at end
    call = await strategyV3AlgoV1.calculateLowestCombination(38000, [65000, 26000, 19500, 13000, 6500]);
    call.result.expectList()[0].expectUintWithDecimals(65000);
    call.result.expectList()[1].expectUintWithDecimals(26000);
    call.result.expectList()[2].expectUintWithDecimals(0);
    call.result.expectList()[3].expectUintWithDecimals(0);
    call.result.expectList()[4].expectUintWithDecimals(0);
  }
});

Clarinet.test({
  name: "strategy-v3-algo-v1: calculate if nothing changes",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV3AlgoV1 = new StrategyV3AlgoV1(chain, deployer)

    // Reach target
    let call = await strategyV3AlgoV1.calculateReachTarget(
      [175000, 75000],
      [175000, 75000]
    );
    call.result.expectList()[0].expectUintWithDecimals(175000);
    call.result.expectList()[1].expectUintWithDecimals(75000);

    // Lowest combination
    call = await strategyV3AlgoV1.calculateLowestCombination(0, [65000, 26000, 19500, 11000, 6500]);
    call.result.expectList()[0].expectUintWithDecimals(65000);
    call.result.expectList()[1].expectUintWithDecimals(26000);
    call.result.expectList()[2].expectUintWithDecimals(19500);
    call.result.expectList()[3].expectUintWithDecimals(11000);
    call.result.expectList()[4].expectUintWithDecimals(6500);

  }
});

//-------------------------------------
// Pools V1 
//-------------------------------------

Clarinet.test({
  name: "strategy-v3-pools-v1: calculate stacking per pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV3PoolsV1 = new StrategyV3PoolsV1(chain, deployer)
    let reserve = new Reserve(chain, deployer);

    // 150k STX to reserve
    let block = chain.mineBlock([
      Tx.transferSTX(150000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // 70% to stacking pool, 20% to fast pool
    let call = await strategyV3PoolsV1.calculateStackingPerPool()
    call.result.expectList()[0].expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"))
    call.result.expectList()[0].expectTuple()["stacking-amount"].expectUintWithDecimals(105000)
    call.result.expectList()[1].expectTuple()["pool"].expectPrincipal(qualifiedName("pox-fast-pool-v2-mock"))
    call.result.expectList()[1].expectTuple()["stacking-amount"].expectUintWithDecimals(45000)

    // Lock for withdrawal to create outflow
    let result = await reserve.lockStxForWithdrawal(deployer, 40000);
    result.expectOk().expectUintWithDecimals(40000);

    // Reduced both pools
    call = await strategyV3PoolsV1.calculateStackingPerPool()
    call.result.expectList()[0].expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"))
    call.result.expectList()[0].expectTuple()["stacking-amount"].expectUintWithDecimals(77000)
    call.result.expectList()[1].expectTuple()["pool"].expectPrincipal(qualifiedName("pox-fast-pool-v2-mock"))
    call.result.expectList()[1].expectTuple()["stacking-amount"].expectUintWithDecimals(33000)
  }
});

Clarinet.test({
  name: "strategy-v3-pools-v1: calculate stacking per pool with direct stacking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV3PoolsV1 = new StrategyV3PoolsV1(chain, deployer)
    let reserve = new Reserve(chain, deployer);
    let dataDirectStacking = new DataDirectStacking(chain, deployer);

    // 150k STX to reserve
    let block = chain.mineBlock([
      Tx.transferSTX(150000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);


    // Set direct stacking
    let result = dataDirectStacking.setTotalDirectStacking(deployer, 20000 + 5000);
    result.expectOk().expectBool(true);
    result = dataDirectStacking.setDirectStackingPoolAmount(deployer, qualifiedName("stacking-pool-v1"), 20000);
    result.expectOk().expectBool(true);
    result = dataDirectStacking.setDirectStackingPoolAmount(deployer, qualifiedName("pox-fast-pool-v2-mock"), 5000);
    result.expectOk().expectBool(true);

    // Check amounts
    let call = await strategyV3PoolsV1.calculateNewAmounts();
    call.result.expectTuple()["new-total-direct-stacking"].expectUintWithDecimals(20000 + 5000)
    call.result.expectTuple()["new-total-normal-stacking"].expectUintWithDecimals(150000 - (20000 + 5000))
    call.result.expectTuple()["inflow"].expectUintWithDecimals(150000)
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0)

    // 25k direct stacking, 125k normal stacking
    // For direct stacking:
    // - 20k to pool
    // For normal stacking:
    // - 80% as normal = 100k - pool has 70%, so gets 70k
    // - 20% as direct = 25k - pool has 80% of direct stacking, so gets 20k
    call = await strategyV3PoolsV1.calculateStackingTargetForPool(qualifiedName("stacking-pool-v1"), 150000 - (20000 + 5000), 20000 + 5000)
    call.result.expectUintWithDecimals(20000 + 70000 + 20000);

    // 25k direct stacking, 125k normal stacking
    // For direct stacking:
    // - 20k to pool
    // For normal stacking:
    // - 80% as normal = 100k - pool has 30%, so gets 30k
    // - 20% as direct = 25k - pool has 20% of direct stacking, so gets 5k
    call = await strategyV3PoolsV1.calculateStackingTargetForPool(qualifiedName("pox-fast-pool-v2-mock"), 150000 - (20000 + 5000), 20000 + 5000)
    call.result.expectUintWithDecimals(5000 + 30000 + 5000);

    // Calculate
    call = await strategyV3PoolsV1.calculateStackingPerPool()
    call.result.expectList()[0].expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"))
    call.result.expectList()[0].expectTuple()["stacking-amount"].expectUintWithDecimals(20000 + 70000 + 20000)
    call.result.expectList()[1].expectTuple()["pool"].expectPrincipal(qualifiedName("pox-fast-pool-v2-mock"))
    call.result.expectList()[1].expectTuple()["stacking-amount"].expectUintWithDecimals(5000 + 30000 + 5000)
  }
});

//-------------------------------------
// Delegates V1 
//-------------------------------------

Clarinet.test({
  name: "strategy-v3-delegates-v1: calculate stacking per delegate",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategyV3DelegatesV1 = new StrategyV3DelegatesV1(chain, deployer)
    let strategyV3 = new StrategyV3(chain, deployer)
    let stackingPool = new StackingPool(chain, deployer);

    // 150k STX to reserve
    let block = chain.mineBlock([
      Tx.transferSTX(200000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    //
    // Calculate stacking per delegate - inflow
    //

    // 50% to first, 30% to second, 20% to third
    let call = await strategyV3DelegatesV1.calculateStackingPerDelegate(qualifiedName("stacking-pool-v1"), 140000);
    call.result.expectList()[0].expectTuple()["delegate"].expectPrincipal(qualifiedName("stacking-delegate-1-1"))
    call.result.expectList()[0].expectTuple()["stacking-amount"].expectUintWithDecimals(70000)
    call.result.expectList()[1].expectTuple()["delegate"].expectPrincipal(qualifiedName("stacking-delegate-1-2"))
    call.result.expectList()[1].expectTuple()["stacking-amount"].expectUintWithDecimals(42000)
    call.result.expectList()[2].expectTuple()["delegate"].expectPrincipal(qualifiedName("stacking-delegate-1-3"))
    call.result.expectList()[2].expectTuple()["stacking-amount"].expectUintWithDecimals(28000)

    // 
    // Stack and lock amount for pool
    //

    // Move to end of cycle 1, where we can prepare
    await chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH + 15);

    let result = await strategyV3.preparePools(deployer);
    result.expectOk().expectBool(true);

    result = await strategyV3.prepareDelegates(deployer, qualifiedName("stacking-pool-v1"));
    result.expectOk().expectBool(true);

    result = await strategyV3.execute(
      deployer,
      qualifiedName("stacking-pool-v1"),
      [qualifiedName("stacking-delegate-1-1"), qualifiedName("stacking-delegate-1-2"), qualifiedName("stacking-delegate-1-3")]
    );
    result.expectOk().expectBool(true);

    result = await stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);


    //
    // Calculate stacking per delegate - outflow
    //

    call = await strategyV3DelegatesV1.calculateLockedForPool(qualifiedName("stacking-pool-v1"));
    call.result.expectUintWithDecimals(140000);

    // Outflow of 40k. So best is to stop delegate-1-2.
    call = await strategyV3DelegatesV1.calculateStackingPerDelegate(qualifiedName("stacking-pool-v1"), 100000);
    call.result.expectList()[0].expectTuple()["delegate"].expectPrincipal(qualifiedName("stacking-delegate-1-1"))
    call.result.expectList()[0].expectTuple()["stacking-amount"].expectUintWithDecimals(70000)
    call.result.expectList()[1].expectTuple()["delegate"].expectPrincipal(qualifiedName("stacking-delegate-1-2"))
    call.result.expectList()[1].expectTuple()["stacking-amount"].expectUintWithDecimals(0)
    call.result.expectList()[2].expectTuple()["delegate"].expectPrincipal(qualifiedName("stacking-delegate-1-3"))
    call.result.expectList()[2].expectTuple()["stacking-amount"].expectUintWithDecimals(28000)

  }
});

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "strategy-v3: start stacking, handle outflow, handle inflow (3 cycles)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stackingDelegate = new StackingDelegate(chain, deployer);
    let strategyV3 = new StrategyV3(chain, deployer)
    let reserve = new Reserve(chain, deployer);
    let stackingPool = new StackingPool(chain, deployer);
    let fastPool = new FastPoolV2(chain, deployer);
    let pox = new Pox4Mock(chain, deployer);


    //
    // Add STX to reserve to stack
    //

    // Move to cycle 1
    await chain.mineEmptyBlockUntil(22);

    let block = chain.mineBlock([
      Tx.transferSTX(250000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Move to end of cycle 1, where we can prepare
    await chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH + 14);


    //
    // Prepare pools and delegates
    //

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

    result = await strategyV3.execute(
      deployer,
      qualifiedName("pox-fast-pool-v2-mock"),
      [qualifiedName("stacking-delegate-2-1"), qualifiedName("stacking-delegate-2-2"), qualifiedName("stacking-delegate-2-3")]
    );
    result.expectOk().expectBool(true);


    //
    // Check data
    //

    let call = await strategyV3.getCyclePreparedPools();
    call.result.expectUint(1);


    call = await strategyV3.getPreparePoolsData(qualifiedName("stacking-pool-v1"));
    call.result.expectTuple()["cycle-prepared-pool"].expectUint(1);
    call.result.expectTuple()["cycle-prepared-delegates"].expectUint(1);
    call.result.expectTuple()["cycle-executed-pool"].expectUint(1);
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(175000);

    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(87500);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-1-2"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(52500);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-1-3"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(35000);


    call = await strategyV3.getPreparePoolsData(qualifiedName("pox-fast-pool-v2-mock"));
    call.result.expectTuple()["cycle-prepared-pool"].expectUint(1);
    call.result.expectTuple()["cycle-prepared-delegates"].expectUint(1);
    call.result.expectTuple()["cycle-executed-pool"].expectUint(1);
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(75000);

    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-2-1"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(37500);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-2-2"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(22500);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-2-3"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(15000);


    //
    // Prepare stacking-pool-v1
    //

    result = await stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(87500);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-2"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(52500);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-3"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(35000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);


    //
    // Prepare pox-fast-pool-v2-mock
    //

    result = await fastPool.delegateStackStxMany(deployer, [qualifiedName("stacking-delegate-2-1"), qualifiedName("stacking-delegate-2-2"), qualifiedName("stacking-delegate-2-3")]);
    result.expectOk().expectTuple()["locking-result"].expectList()

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(37499);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(1);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-2"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(22499);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(1);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-3"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(14999);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(1);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 3);


    //
    // Lock STX so there is outflow
    //

    result = await reserve.lockStxForWithdrawal(deployer, 40000);
    result.expectOk().expectUintWithDecimals(40000);


    //
    // Prepare pools, prepare delegates and execute pools
    //

    // Move to end of cycle 2, where we can prepare
    await chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH * 2 + 14);

    result = await strategyV3.preparePools(deployer);
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

    result = await strategyV3.execute(
      deployer,
      qualifiedName("pox-fast-pool-v2-mock"),
      [qualifiedName("stacking-delegate-2-1"), qualifiedName("stacking-delegate-2-2"), qualifiedName("stacking-delegate-2-3")]
    );
    result.expectOk().expectBool(true);


    //
    // Check data
    //

    call = await strategyV3.getCyclePreparedPools();
    call.result.expectUint(2);

    call = await strategyV3.getPreparePoolsData(qualifiedName("stacking-pool-v1"));
    call.result.expectTuple()["cycle-prepared-pool"].expectUint(2);
    call.result.expectTuple()["cycle-prepared-delegates"].expectUint(2);
    call.result.expectTuple()["cycle-executed-pool"].expectUint(2);
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(147000);

    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(87500);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-1-2"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(52500);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-1-3"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(0); // 28k outflow so stopped this delegate


    call = await strategyV3.getPreparePoolsData(qualifiedName("pox-fast-pool-v2-mock"));
    call.result.expectTuple()["cycle-prepared-pool"].expectUint(2);
    call.result.expectTuple()["cycle-prepared-delegates"].expectUint(2);
    call.result.expectTuple()["cycle-executed-pool"].expectUint(2);
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(63000);

    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-2-1"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(37499);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-2-2"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(22499);
    call = await strategyV3.getPrepareDelegatesData(qualifiedName("stacking-delegate-2-3"));
    call.result.expectTuple()["stacking-amount"].expectUintWithDecimals(0); // 12k outflow so stopped this delegate


    //
    // Prepare pools
    //

    result = await stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);

    result = await fastPool.delegateStackStxMany(deployer, [qualifiedName("stacking-delegate-2-1"), qualifiedName("stacking-delegate-2-2"), qualifiedName("stacking-delegate-2-3")]);
    result.expectOk().expectTuple()["locking-result"].expectList()


    //
    // Unlocks
    //

    // Move to next cycle so we can unlock
    await chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH * 3 + 2);

    result = await pox.unlock(deployer, qualifiedName("stacking-delegate-1-3"));
    result.expectOk().expectUintWithDecimals(35000);

    result = await pox.unlock(deployer, qualifiedName("stacking-delegate-2-3"));
    result.expectOk().expectUintWithDecimals(14999);

    result = await strategyV3.returnUnlockedStx(deployer, [qualifiedName("stacking-delegate-1-3"), qualifiedName("stacking-delegate-2-3")])
    result.expectOk().expectList()[0].expectOk().expectUintWithDecimals(35000);
    result.expectOk().expectList()[1].expectOk().expectUintWithDecimals(14999);


    //
    // Data
    //

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(87500);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 4);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-2"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(52500);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 4);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-3"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(0);


    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(37499);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 4);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-2"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(22499);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 4);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-3"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(0);


    //
    // Inflow
    //

    block = chain.mineBlock([
      Tx.transferSTX(50000 * 1000000, qualifiedName("reserve-v1"), deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);


    //
    // Prepare pools, prepare delegates and execute pools
    //

    // Move to end of cycle 3, where we can prepare
    await chain.mineEmptyBlockUntil(REWARD_CYCLE_LENGTH * 3 + 13);

    result = await strategyV3.preparePools(deployer);
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

    result = await strategyV3.execute(
      deployer,
      qualifiedName("pox-fast-pool-v2-mock"),
      [qualifiedName("stacking-delegate-2-1"), qualifiedName("stacking-delegate-2-2"), qualifiedName("stacking-delegate-2-3")]
    );
    result.expectOk().expectBool(true);


    //
    // Prepare pools
    //

    result = await stackingPool.prepare(deployer);
    result.expectOk().expectBool(true);

    result = await fastPool.delegateStackStxMany(deployer, [qualifiedName("stacking-delegate-2-1"), qualifiedName("stacking-delegate-2-2"), qualifiedName("stacking-delegate-2-3")]);
    result.expectOk().expectTuple()["locking-result"].expectList()


    //
    // Data
    //

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(91000);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 5);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-2"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(54600);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 5);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-1-3"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(36400);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 5);


    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-1"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(38999);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(1);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 5);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-2"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(23399);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(1);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 5);

    call = await stackingDelegate.getStxAccount(qualifiedName("stacking-delegate-2-3"));
    call.result.expectTuple()["locked"].expectUintWithDecimals(15599);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(1);
    call.result.expectTuple()["unlock-height"].expectUint(REWARD_CYCLE_LENGTH * 5);

  }
});


//-------------------------------------
// Errors 
//-------------------------------------

//-------------------------------------
// Access 
//-------------------------------------
