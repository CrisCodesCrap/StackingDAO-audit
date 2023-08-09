import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/tests-utils.ts";
qualifiedName('')

import { StrategyV1 as Strategy } from './helpers/strategy-helpers.ts';
import { Core } from './helpers/core-helpers.ts';
import { Reserve } from './helpers/reserve-helpers.ts';

//-------------------------------------
// Getters
//-------------------------------------


//-------------------------------------
// Calculations - Get inflow/outflow
//-------------------------------------

// TODO: focus on get inflow/outflow only
Clarinet.test({
  name: "strategy-v1: get inflow/outflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategy = new Strategy(chain, deployer);
    let core = new Core(chain, deployer);
    let reserve = new Reserve(chain, deployer);

    // Advance 5 cycles
    chain.mineEmptyBlock(500 + 2001 * 5);

    // Now in cycle 5
    let call = await strategy.getPoxCycle();
    call.result.expectUint(5);

    call = await strategy.getPrepareCycleLength();
    call.result.expectUint(100);

    // Min stack amount is 50k STX
    call = await strategy.getStackingMinimum();
    call.result.expectUintWithDecimals(50000);

    // Deposit 3x min
    let result = await core.deposit(deployer, 50000 * 3);
    result.expectOk().expectUintWithDecimals(50000 * 3);

    call = await strategy.getOutflowInflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(50000 * 3);

    result = strategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    call = await reserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(50000 * 3);

    call = await reserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await reserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(50000 * 3);
  }
});

//-------------------------------------
// Calculations - Outflow
//-------------------------------------

Clarinet.test({
  name: "strategy-v1: calculate stacking outflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategy = new Strategy(chain, deployer);
    let core = new Core(chain, deployer);

    let result = await core.deposit(deployer, 50000 * 13);
    result.expectOk().expectUintWithDecimals(50000 * 13);

    // Advance to prepare phase
    chain.mineEmptyBlock(4150);

    // Stack
    result = strategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    // Check inflows after stacking
    let call = await strategy.getStackerInflow(1);
    call.result.expectUintWithDecimals(50000);

    call = await strategy.getStackerInflow(2);
    call.result.expectUintWithDecimals(122500);

    call = await strategy.getStackerInflow(3);
    call.result.expectUintWithDecimals(97500);

    call = await strategy.getStackerInflow(4);
    call.result.expectUintWithDecimals(65000);

    call = await strategy.getStackerInflow(5);
    call.result.expectUintWithDecimals(65000);

    call = await strategy.getStackerInflow(6);
    call.result.expectUintWithDecimals(50000);

    call = await strategy.getStackerInflow(7);
    call.result.expectUintWithDecimals(50000);

    call = await strategy.getStackerInflow(8);
    call.result.expectUintWithDecimals(50000);

    call = await strategy.getStackerInflow(9);
    call.result.expectUintWithDecimals(50000);

    call = await strategy.getStackerInflow(10);
    call.result.expectUintWithDecimals(50000);

    // Calculate outflow for 160k STX
    result = await strategy.calculateStackingOutflow(deployer, 97500 + 50000);
    result.expectOk().expectBool(true);

    call = await strategy.getStackersToStop();
    call.result.expectList()[0].expectUint(3);
    call.result.expectList()[1].expectUint(4);

    // TODO: would be better to stop 3 of 5k?

    // TODO: check min left
    call = await strategy.getMinimumLeftover();
    call.result.expectUintWithDecimals(15000);

  }
});

//-------------------------------------
// Calculations - Inflow
//-------------------------------------

Clarinet.test({
  name: "strategy-v1: calculate stacking inflow - minimum",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategy = new Strategy(chain, deployer);

    // Min stack amount is 50k STX
    let call = await strategy.getStackingMinimum();
    call.result.expectUintWithDecimals(50000);

    // Inflow = 3 x min-stack-amount
    let result = await strategy.calculateStackingInflow(deployer, 50000 * 3);
    result.expectOk().expectBool(true);

    // Stack amount devided over last 3 stackers
    for (let id = 8; id <= 10; id++) {
      call = await strategy.getStackerInflow(id);
      call.result.expectUintWithDecimals(50000);
    }

    // Other stackers not active yet
    for (let id = 1; id <= 7; id++) {
      call = await strategy.getStackerInflow(id);
      call.result.expectUintWithDecimals(0);
    }

  }
});

//-------------------------------------
// Perform - Inflow
//-------------------------------------

Clarinet.test({
  name: "strategy-v1: perform inflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let strategy = new Strategy(chain, deployer);
    let core = new Core(chain, deployer);
    let reserve = new Reserve(chain, deployer);

    // Deposit 3x min
    let result = await core.deposit(deployer, 50000 * 3);
    result.expectOk().expectUintWithDecimals(50000 * 3);

    let call = await strategy.getOutflowInflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(50000 * 3);

    // Advance to prepare phase
    chain.mineEmptyBlock(4150);

    // Stack
    result = strategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    call = await reserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(50000 * 3);

    call = await reserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await reserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(50000 * 3);

    // Deposit 10x min
    result = await core.deposit(deployer, 50000 * 10);
    result.expectOk().expectUintWithDecimals(50000 * 10);

    call = await strategy.getOutflowInflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(50000 * 10);

    // Check inflow calculations
    result = await strategy.calculateStackingInflow(deployer, 50000 * 10);
    result.expectOk().expectBool(true);

    // 50000+122500+97500+65000+65000+50000+50000=500000

    call = await strategy.getStackerInflow(1);
    call.result.expectUintWithDecimals(50000);

    call = await strategy.getStackerInflow(2);
    call.result.expectUintWithDecimals(122500);

    call = await strategy.getStackerInflow(3);
    call.result.expectUintWithDecimals(97500);

    call = await strategy.getStackerInflow(4);
    call.result.expectUintWithDecimals(65000);

    call = await strategy.getStackerInflow(5);
    call.result.expectUintWithDecimals(65000);

    call = await strategy.getStackerInflow(6);
    call.result.expectUintWithDecimals(50000);

    call = await strategy.getStackerInflow(7);
    call.result.expectUintWithDecimals(50000);

    // Last 3 stackers already hit target of 5%
    call = await strategy.getStackerInflow(8);
    call.result.expectUintWithDecimals(0);

    call = await strategy.getStackerInflow(9);
    call.result.expectUintWithDecimals(0);

    call = await strategy.getStackerInflow(10);
    call.result.expectUintWithDecimals(0);

    // Advance to prepare phase
    chain.mineEmptyBlock(4150);

    // Stack
    result = strategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    call = await reserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(50000 * 13);

    call = await reserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await reserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(50000 * 13);



    // Fill up stackers with lowest percentage first


    result = await strategy.calculateStackingInflow(deployer, 300000);
    result.expectOk().expectBool(true);

    call = await strategy.getStackerInflow(1);
    call.result.expectUintWithDecimals(0);

    call = await strategy.getStackerInflow(2);
    call.result.expectUintWithDecimals(117500);

    call = await strategy.getStackerInflow(3);
    call.result.expectUintWithDecimals(92500);

    call = await strategy.getStackerInflow(4);
    call.result.expectUintWithDecimals(45000);

    call = await strategy.getStackerInflow(5);
    call.result.expectUintWithDecimals(45000);

    call = await strategy.getStackerInflow(6);
    call.result.expectUintWithDecimals(0);

    call = await strategy.getStackerInflow(7);
    call.result.expectUintWithDecimals(0);

    // Last 3 stackers already hit target of 5%
    call = await strategy.getStackerInflow(8);
    call.result.expectUintWithDecimals(0);

    call = await strategy.getStackerInflow(9);
    call.result.expectUintWithDecimals(0);

    call = await strategy.getStackerInflow(10);
    call.result.expectUintWithDecimals(0);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "strategy-v1: ....",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let strategy = new Strategy(chain, deployer);

 
  }
});
