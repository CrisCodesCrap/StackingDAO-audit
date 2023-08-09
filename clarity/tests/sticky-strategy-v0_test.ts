import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { hexToBytes, qualifiedName } from "./helpers/sticky-tests-utils.ts";
qualifiedName('')

import { StickyStrategyV0 as StickyStrategy } from './helpers/sticky-strategy-helpers.ts';
import { StickyCore } from './helpers/sticky-core-helpers.ts';
import { StickyReserve } from './helpers/sticky-reserve-helpers.ts';
import { StickyStacker1 } from './helpers/sticky-stacker-1-helpers.ts';
import { Pox3Mock } from './helpers/pox-3-mock-helpers.ts';

//-------------------------------------
// Reward address
//-------------------------------------

Clarinet.test({
  name: "strategy-v0: get and set reward address",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStrategy = new StickyStrategy(chain, deployer);

    let call = await stickyStrategy.getPoxRewardAddress();
    call.result.expectTuple()["version"].expectBuff(hexToBytes("0x00"));
    call.result.expectTuple()["hashbytes"].expectBuff(hexToBytes("0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac"));

    let result = await stickyStrategy.setPoxRewardAddress(deployer, hexToBytes("0x01"), hexToBytes("0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ab"));
    result.expectOk().expectBool(true);

    call = await stickyStrategy.getPoxRewardAddress();
    call.result.expectTuple()["version"].expectBuff(hexToBytes("0x01"));
    call.result.expectTuple()["hashbytes"].expectBuff(hexToBytes("0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ab"));
  }
});

//-------------------------------------
// Calculations - Get inflow/outflow
//-------------------------------------

Clarinet.test({
  name: "strategy-v0: calculate inflow/outflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStrategy = new StickyStrategy(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);
    let stickyReserve = new StickyReserve(chain, deployer);
    let poxMock = new Pox3Mock(chain, deployer);

    //
    // Deposit 300k STX
    //
    let result = stickyCore.deposit(deployer, 300000);
    result.expectOk().expectUintWithDecimals(300000);

    let call = stickyStrategy.getInflowOutflow();
    call.result.expectTuple()["inflow"].expectUintWithDecimals(300000);
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["total-stacking"].expectUintWithDecimals(0);

    result = stickyStrategy.performInflow(deployer, [50000, 50000, 50000, 50000, 50000, 50000, 0, 0, 0, 0]);
    result.expectOk().expectBool(true);

    // Cycle info
    call = stickyCore.getCycleInfo(0);
    call.result.expectTuple()["deposited"].expectUintWithDecimals(300000);
    call.result.expectTuple()["withdraw-init"].expectUintWithDecimals(0);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(1);

    // 
    // Deposit 500k STX
    //
    result = stickyCore.deposit(deployer, 500000);
    result.expectOk().expectUintWithDecimals(500000);

    call = stickyStrategy.getInflowOutflow();
    call.result.expectTuple()["inflow"].expectUintWithDecimals(500000);
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["total-stacking"].expectUintWithDecimals(300000);
    call.result.expectTuple()["total-idle"].expectUintWithDecimals(500000);
    call.result.expectTuple()["total-withdrawals"].expectUintWithDecimals(0);

    result = stickyStrategy.performInflow(deployer, [50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000]);
    result.expectOk().expectBool(true);

    // Cycle info
    call = stickyCore.getCycleInfo(1);
    call.result.expectTuple()["deposited"].expectUintWithDecimals(500000);
    call.result.expectTuple()["withdraw-init"].expectUintWithDecimals(0);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(2);

    // 
    // Deposit 10k STX, but 30k to be withdrawn
    // So net outflow of 20k STX
    //

    result = stickyCore.deposit(deployer, 10000);
    result.expectOk().expectUintWithDecimals(10000);

    result = stickyCore.initWithdraw(deployer, 30000);
    result.expectOk().expectUintWithDecimals(30000);

    call = stickyStrategy.getInflowOutflow();
    call.result.expectTuple()["inflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["outflow"].expectUintWithDecimals(20000);
    call.result.expectTuple()["total-stacking"].expectUintWithDecimals(800000);
    call.result.expectTuple()["total-idle"].expectUintWithDecimals(10000);
    call.result.expectTuple()["total-withdrawals"].expectUintWithDecimals(30000);

    result = stickyStrategy.performOutflow(deployer, [true, false, false, false, false, false, false, false, false, false]);
    result.expectOk().expectBool(true);

    // Cycle info
    call = stickyCore.getCycleInfo(2);
    call.result.expectTuple()["deposited"].expectUintWithDecimals(10000);
    call.result.expectTuple()["withdraw-init"].expectUintWithDecimals(0);

    // Cycle info
    call = stickyCore.getCycleInfo(3);
    call.result.expectTuple()["deposited"].expectUintWithDecimals(0);
    call.result.expectTuple()["withdraw-init"].expectUintWithDecimals(30000);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(3);

    //
    // Return STX to reserve
    //

    // Need to unlock manually in tests
    // Stacked 50k initally + 50k second time = 100k total
    result = await poxMock.unlock(deployer, qualifiedName("sticky-stacker-1"));
    result.expectOk().expectUintWithDecimals(100000);

    // Return STX
    result = stickyStrategy.stackersReturnStx(deployer);
    result.expectOk().expectBool(true);

    // 10k STX from deposit + 100k STX from stopping stacker 1
    call = stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(110000);

    // Was stacking 800k STX but stopped stacker with 100k STX
    call = stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(700000);

    call = stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(810000);

    // 
    // Deposit 30k STX, but 10k to be withdrawn
    // So net inflow of 20k STX
    //

    result = stickyCore.deposit(deployer, 30000);
    result.expectOk().expectUintWithDecimals(30000);

    result = stickyCore.initWithdraw(deployer, 10000);
    result.expectOk().expectUintWithDecimals(10000);

    // 110k STX idle, of which 30k STX for withdrawals
    // Now there is a net inflow of 20k STX
    // So inflow should be: (110-30)+20 = 100
    call = stickyStrategy.getInflowOutflow();
    call.result.expectTuple()["inflow"].expectUintWithDecimals(100000);
    call.result.expectTuple()["outflow"].expectUintWithDecimals(0);
    call.result.expectTuple()["total-stacking"].expectUintWithDecimals(700000);
    // 100k from stopped stacker + 10k deposit + 30k deposit
    call.result.expectTuple()["total-idle"].expectUintWithDecimals(140000);
    // 30k + 10k
    call.result.expectTuple()["total-withdrawals"].expectUintWithDecimals(40000);

    // Perform inflow
    result = stickyStrategy.performInflow(deployer, [50000, 0, 0, 0, 0, 0, 0, 0, 0, 50000]);
    result.expectOk().expectBool(true);

    // Cycle info
    call = stickyCore.getCycleInfo(3);
    call.result.expectTuple()["deposited"].expectUintWithDecimals(30000);
    call.result.expectTuple()["withdraw-init"].expectUintWithDecimals(30000);

    // Cycle info
    call = stickyCore.getCycleInfo(4);
    call.result.expectTuple()["deposited"].expectUintWithDecimals(0);
    call.result.expectTuple()["withdraw-init"].expectUintWithDecimals(10000);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(4);
  }
});

//-------------------------------------
// Perform - Inflow
//-------------------------------------

Clarinet.test({
  name: "strategy-v0: perform inflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStrategy = new StickyStrategy(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);

    let result = stickyCore.deposit(deployer, 300000);
    result.expectOk().expectUintWithDecimals(300000);

    let call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(0);

    // Initiate stacking
    result = stickyStrategy.performInflow(deployer, [50000, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    result.expectOk().expectBool(true);

    // Last cycle performed increased
    call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(1);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(1);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(1);

    // Tokens are now locked
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(50000);
    call.result.expectTuple()["unlock-height"].expectUint(4200);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(1);

    // Increase stacking
    result = stickyStrategy.performInflow(deployer, [10000, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    result.expectOk().expectBool(true);

    // Last cycle performed increased
    call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(2);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(1);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(2);

    // Tokens are now locked
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(60000);
    call.result.expectTuple()["unlock-height"].expectUint(6300);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(2);
    
    // Extend stacking
    result = stickyStrategy.performInflow(deployer, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    result.expectOk().expectBool(true);

    // Last cycle performed increased
    call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(3);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(2);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(2);

    // Tokens are now locked
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(60000);
    call.result.expectTuple()["unlock-height"].expectUint(8400);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
  }
});

//-------------------------------------
// Perform - Outflow
//-------------------------------------

Clarinet.test({
  name: "strategy-v0: perform outflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStrategy = new StickyStrategy(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);
    let poxMock = new Pox3Mock(chain, deployer);

    let result = stickyCore.deposit(deployer, 300000);
    result.expectOk().expectUintWithDecimals(300000);

    let call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(0);

    // Initiate stacking
    result = stickyStrategy.performInflow(deployer, [50000, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    result.expectOk().expectBool(true);

    // Last cycle performed increased
    call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(1);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(1);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(1);

    // Tokens are now locked
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(50000);
    call.result.expectTuple()["unlock-height"].expectUint(4200);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(1);
    
    // Perform outflow - do not stop stacker 1
    result = stickyStrategy.performOutflow(deployer, [false, false, false, false, false, false, false, false, false, false]);
    result.expectOk().expectBool(true);

    // Last cycle performed increased
    call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(2);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(1);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(2);

    // Tokens are now locked
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(50000);
    call.result.expectTuple()["unlock-height"].expectUint(6300);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    // Advance 1 cycle
    chain.mineEmptyBlock(2100);

    call = stickyStrategy.getPoxCycle()
    call.result.expectUint(2);
    
    // Perform outflow - stop stacker 1
    result = stickyStrategy.performOutflow(deployer, [true, false, false, false, false, false, false, false, false, false]);
    result.expectOk().expectBool(true);

    // Last cycle performed increased
    call = stickyStrategy.getLastCyclePerformed();
    call.result.expectUint(3);

    // Advance to unlock height
    chain.mineEmptyBlock(6300);

    // Need to unlock manually in tests
    // Stacked 50k initally + 50k second time = 100k total
    result = await poxMock.unlock(deployer, qualifiedName("sticky-stacker-1"));
    result.expectOk().expectUintWithDecimals(50000);

    // Return STX
    result = stickyStrategy.stackersReturnStx(deployer);
    result.expectOk().expectBool(true);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectNone();

    // Tokens are now locked
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "strategy-v0: only protocol can perform inflow/outflow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyStrategy = new StickyStrategy(chain, deployer);

    let result = stickyStrategy.performInflow(wallet_1, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    result.expectErr().expectUint(20003);
 
    result = stickyStrategy.performOutflow(wallet_1, [true, false, false, false, false, false, false, false, false, false]);
    result.expectErr().expectUint(20003);
  }
});
