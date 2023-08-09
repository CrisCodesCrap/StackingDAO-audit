import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/sticky-tests-utils.ts";
qualifiedName('')

import { StickyStrategyV1 as StickyStrategy } from './helpers/sticky-strategy-helpers.ts';
import { StickyCore } from './helpers/sticky-core-helpers.ts';
import { StickyReserve } from './helpers/sticky-reserve-helpers.ts';

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

    let stickyStrategy = new StickyStrategy(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);
    let stickyReserve = new StickyReserve(chain, deployer);

    // Advance 5 cycles
    chain.mineEmptyBlock(500 + 2001 * 5);

    // Now in cycle 5
    let call = await stickyStrategy.getPoxCycle();
    call.result.expectUint(5);

    call = await stickyStrategy.getPrepareCycleLength();
    call.result.expectUint(100);

    // Min stack amount is 50k STX
    call = await stickyStrategy.getStackingMinimum();
    call.result.expectUintWithDecimals(50000);

    // Deposit 3x min
    let result = await stickyCore.deposit(deployer, 50000 * 3);
    result.expectOk().expectUintWithDecimals(50000 * 3);

    call = await stickyStrategy.getOutflowInflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(50000 * 3);

    result = stickyStrategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(50000 * 3);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
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

    let stickyStrategy = new StickyStrategy(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);

    let result = await stickyCore.deposit(deployer, 50000 * 13);
    result.expectOk().expectUintWithDecimals(50000 * 13);

    // Advance to prepare phase
    chain.mineEmptyBlock(4150);

    // Stack
    result = stickyStrategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    // Check inflows after stacking
    let call = await stickyStrategy.getStackerInflow(1);
    call.result.expectUintWithDecimals(50000);

    call = await stickyStrategy.getStackerInflow(2);
    call.result.expectUintWithDecimals(122500);

    call = await stickyStrategy.getStackerInflow(3);
    call.result.expectUintWithDecimals(97500);

    call = await stickyStrategy.getStackerInflow(4);
    call.result.expectUintWithDecimals(65000);

    call = await stickyStrategy.getStackerInflow(5);
    call.result.expectUintWithDecimals(65000);

    call = await stickyStrategy.getStackerInflow(6);
    call.result.expectUintWithDecimals(50000);

    call = await stickyStrategy.getStackerInflow(7);
    call.result.expectUintWithDecimals(50000);

    call = await stickyStrategy.getStackerInflow(8);
    call.result.expectUintWithDecimals(50000);

    call = await stickyStrategy.getStackerInflow(9);
    call.result.expectUintWithDecimals(50000);

    call = await stickyStrategy.getStackerInflow(10);
    call.result.expectUintWithDecimals(50000);

    // Calculate outflow for 160k STX
    result = await stickyStrategy.calculateStackingOutflow(deployer, 97500 + 50000);
    result.expectOk().expectBool(true);

    call = await stickyStrategy.getStackersToStop();
    call.result.expectList()[0].expectUint(3);
    call.result.expectList()[1].expectUint(4);

    // TODO: would be better to stop 3 of 5k?

    // TODO: check min left
    call = await stickyStrategy.getMinimumLeftover();
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

    let stickyStrategy = new StickyStrategy(chain, deployer);

    // Min stack amount is 50k STX
    let call = await stickyStrategy.getStackingMinimum();
    call.result.expectUintWithDecimals(50000);

    // Inflow = 3 x min-stack-amount
    let result = await stickyStrategy.calculateStackingInflow(deployer, 50000 * 3);
    result.expectOk().expectBool(true);

    // Stack amount devided over last 3 stackers
    for (let id = 8; id <= 10; id++) {
      call = await stickyStrategy.getStackerInflow(id);
      call.result.expectUintWithDecimals(50000);
    }

    // Other stackers not active yet
    for (let id = 1; id <= 7; id++) {
      call = await stickyStrategy.getStackerInflow(id);
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

    let stickyStrategy = new StickyStrategy(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);
    let stickyReserve = new StickyReserve(chain, deployer);

    // Deposit 3x min
    let result = await stickyCore.deposit(deployer, 50000 * 3);
    result.expectOk().expectUintWithDecimals(50000 * 3);

    let call = await stickyStrategy.getOutflowInflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(50000 * 3);

    // Advance to prepare phase
    chain.mineEmptyBlock(4150);

    // Stack
    result = stickyStrategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(50000 * 3);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(50000 * 3);

    // Deposit 10x min
    result = await stickyCore.deposit(deployer, 50000 * 10);
    result.expectOk().expectUintWithDecimals(50000 * 10);

    call = await stickyStrategy.getOutflowInflow();
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["inflow"].expectUintWithDecimals(50000 * 10);

    // Check inflow calculations
    result = await stickyStrategy.calculateStackingInflow(deployer, 50000 * 10);
    result.expectOk().expectBool(true);

    // 50000+122500+97500+65000+65000+50000+50000=500000

    call = await stickyStrategy.getStackerInflow(1);
    call.result.expectUintWithDecimals(50000);

    call = await stickyStrategy.getStackerInflow(2);
    call.result.expectUintWithDecimals(122500);

    call = await stickyStrategy.getStackerInflow(3);
    call.result.expectUintWithDecimals(97500);

    call = await stickyStrategy.getStackerInflow(4);
    call.result.expectUintWithDecimals(65000);

    call = await stickyStrategy.getStackerInflow(5);
    call.result.expectUintWithDecimals(65000);

    call = await stickyStrategy.getStackerInflow(6);
    call.result.expectUintWithDecimals(50000);

    call = await stickyStrategy.getStackerInflow(7);
    call.result.expectUintWithDecimals(50000);

    // Last 3 stackers already hit target of 5%
    call = await stickyStrategy.getStackerInflow(8);
    call.result.expectUintWithDecimals(0);

    call = await stickyStrategy.getStackerInflow(9);
    call.result.expectUintWithDecimals(0);

    call = await stickyStrategy.getStackerInflow(10);
    call.result.expectUintWithDecimals(0);

    // Advance to prepare phase
    chain.mineEmptyBlock(4150);

    // Stack
    result = stickyStrategy.performStacking(deployer);
    result.expectOk().expectBool(true);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(50000 * 13);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(50000 * 13);



    // Fill up stackers with lowest percentage first


    result = await stickyStrategy.calculateStackingInflow(deployer, 300000);
    result.expectOk().expectBool(true);

    call = await stickyStrategy.getStackerInflow(1);
    call.result.expectUintWithDecimals(0);

    call = await stickyStrategy.getStackerInflow(2);
    call.result.expectUintWithDecimals(117500);

    call = await stickyStrategy.getStackerInflow(3);
    call.result.expectUintWithDecimals(92500);

    call = await stickyStrategy.getStackerInflow(4);
    call.result.expectUintWithDecimals(45000);

    call = await stickyStrategy.getStackerInflow(5);
    call.result.expectUintWithDecimals(45000);

    call = await stickyStrategy.getStackerInflow(6);
    call.result.expectUintWithDecimals(0);

    call = await stickyStrategy.getStackerInflow(7);
    call.result.expectUintWithDecimals(0);

    // Last 3 stackers already hit target of 5%
    call = await stickyStrategy.getStackerInflow(8);
    call.result.expectUintWithDecimals(0);

    call = await stickyStrategy.getStackerInflow(9);
    call.result.expectUintWithDecimals(0);

    call = await stickyStrategy.getStackerInflow(10);
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

    let stickyStrategy = new StickyStrategy(chain, deployer);

 
  }
});
