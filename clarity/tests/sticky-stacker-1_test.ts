import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/sticky-tests-utils.ts";

import { StickyDAO } from './helpers/sticky-dao-helpers.ts';
import { StickyReserve } from './helpers/sticky-reserve-helpers.ts';
import { StickyCore } from './helpers/sticky-core-helpers.ts';
import { StickyStacker1 } from './helpers/sticky-stacker-1-helpers.ts';
import { Pox3Mock } from './helpers/pox-3-mock-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "stacker: can initiate stacking, increase and extend",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyCore = new StickyCore(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);

    // Check PoX info
    let call = await stickyStacker1.getPoxInfo();
    call.result.expectTuple()["reward-cycle-id"].expectUint(0);
    call.result.expectTuple()["reward-cycle-length"].expectUint(2100);
    call.result.expectTuple()["min-amount-ustx"].expectUintWithDecimals(50000);

    // Deposit 150k STX to reserve
    let result = await stickyCore.deposit(deployer, 150000);
    result.expectOk().expectUintWithDecimals(150000);

    call = await stickyStacker1.poxCanStackStx(deployer, 125000, 0, 1);
    call.result.expectOk().expectBool(true);

    call = stickyStacker1.getStxBalance();
    call.result.expectUintWithDecimals(0);

    // No stacker info yet
    call = await stickyStacker1.getStackerInfo();
    call.result.expectNone();

    // Nothing locked yet. Unlocked 0 as stacker does not have any tokens.
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    // In cycle 0
    call = await stickyStacker1.getPoxInfo();
    call.result.expectTuple()["reward-cycle-id"].expectUintWithDecimals(0);

    //
    // Start stacking
    //
    result = await stickyStacker1.initiateStacking(deployer, 125000, 0, 1);
    result.expectOk().expectUintWithDecimals(125000);

    // Check if burn height updated
    call = await stickyStacker1.getStackingUnlockBurnHeight();
    call.result.expectUint(4200);

    // Check if STX stacked updated
    call = await stickyStacker1.getStxStacked();
    call.result.expectUintWithDecimals(125000);

    call = await stickyStacker1.getStackingStxStacked();
    call.result.expectUintWithDecimals(125000);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(1);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(1);

    // Tokens are now locked
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(125000);
    call.result.expectTuple()["unlock-height"].expectUint(4200);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    //
    // Extend with 1 cycle
    //
    result = await stickyStacker1.stackExtend(deployer, 1);
    result.expectOk().expectUint(1);

    // Check if burn height updated
    call = await stickyStacker1.getStackingUnlockBurnHeight();
    call.result.expectUint(6300);

    // Check if STX stacked updated
    call = await stickyStacker1.getStxStacked();
    call.result.expectUintWithDecimals(125000);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(1);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(2);

    // Tokens are now locked for extra 2100 blocks
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(125000);
    call.result.expectTuple()["unlock-height"].expectUint(6300);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    //
    // Increase with 5k STX
    //
    result = await stickyStacker1.stackIncrease(deployer, 5000);
    result.expectOk().expectUintWithDecimals(5000);

    // Check if burn height updated
    call = await stickyStacker1.getStackingUnlockBurnHeight();
    call.result.expectUint(6300);

    // Check if STX stacked updated
    call = await stickyStacker1.getStxStacked();
    call.result.expectUintWithDecimals(130000);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectSome().expectTuple()["first-reward-cycle"].expectUint(1);
    call.result.expectSome().expectTuple()["lock-period"].expectUint(2);

    // Locked increased
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(130000);
    call.result.expectTuple()["unlock-height"].expectUint(6300);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
  }
});

Clarinet.test({
  name: "stacker: when stacking stopped, STX can be returned to reserve",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyReserve = new StickyReserve(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);
    let poxMock = new Pox3Mock(chain, deployer);

    // Deposit 150k STX to reserve
    let result = await stickyCore.deposit(deployer, 150000);
    result.expectOk().expectUintWithDecimals(150000);

    //
    // Start stacking
    //
    result = await stickyStacker1.initiateStacking(deployer, 125000, 0, 1);
    result.expectOk().expectUintWithDecimals(125000);

    // Tokens are now locked
    let call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(125000);
    call.result.expectTuple()["unlock-height"].expectUint(4200);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);

    //
    // Stop stacking
    //

    // Advance to unlock height
    chain.mineEmptyBlock(4200);

    // Unlock (125k STX will be unlocked)
    result = await poxMock.unlock(deployer, qualifiedName("sticky-stacker-1"));
    result.expectOk().expectUintWithDecimals(125000);

    // Check if burn height updated
    call = await stickyStacker1.getStackingUnlockBurnHeight();
    call.result.expectUint(4200);

    // Check if STX stacked updated
    call = await stickyStacker1.getStxStacked();
    call.result.expectUintWithDecimals(0);

    // This var is not reset, which is intended
    call = await stickyStacker1.getStackingStxStacked();
    call.result.expectUintWithDecimals(125000);

    // Stacker info
    call = await stickyStacker1.getStackerInfo();
    call.result.expectNone()

    // Account updated
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(125000);

    //
    // STX tokens to reserve
    //

    call = await stickyStacker1.getStxBalance();
    call.result.expectUintWithDecimals(125000);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(150000);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(25000);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(125000);

    result = await stickyStacker1.returnStx(deployer);
    result.expectOk().expectUintWithDecimals(125000);

    call = await stickyStacker1.getStxBalance();
    call.result.expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(150000);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(150000);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(0);

    // Account updated
    call = await stickyStacker1.getStxAccount();
    call.result.expectTuple()["locked"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-height"].expectUint(0);
    call.result.expectTuple()["unlocked"].expectUintWithDecimals(0);
  }
});

Clarinet.test({
  name: "stacker: can call return STX even when no balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStacker1 = new StickyStacker1(chain, deployer);

    let result = await stickyStacker1.returnStx(deployer);
    result.expectOk().expectUintWithDecimals(0)
  }
});

//-------------------------------------
// Errors 
//-------------------------------------

Clarinet.test({
  name: "stacker: stacker can stack errors",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let stickyCore = new StickyCore(chain, deployer);

    let stickyStacker1 = new StickyStacker1(chain, deployer);

    // Treshold not met
    let call = await stickyStacker1.poxCanStackStx(deployer, 100, 0, 1);
    call.result.expectErr().expectUint(11);
  }
});

Clarinet.test({
  name: "stacker: initiate stacking errors",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let stickyCore = new StickyCore(chain, deployer);

    let stickyStacker1 = new StickyStacker1(chain, deployer);

    // Not enough balance
    let result = await stickyStacker1.initiateStacking(deployer, 125000, 0, 1);
    result.expectErr().expectUint(1);

    result = await stickyCore.deposit(deployer, 150000);
    result.expectOk().expectUintWithDecimals(150000);

    // Invalid start burn height
    result = await stickyStacker1.initiateStacking(deployer, 125000, 100000, 1);
    result.expectErr().expectUint(24);
  }
});

Clarinet.test({
  name: "stacker: stacking extend errors",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStacker1 = new StickyStacker1(chain, deployer);

    // Noting locked
    let result = await stickyStacker1.stackExtend(deployer, 1);
    result.expectErr().expectUint(26);
  }
});

Clarinet.test({
  name: "stacker: stacking increase errors",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let stickyCore = new StickyCore(chain, deployer);

    let stickyStacker1 = new StickyStacker1(chain, deployer);

    // Insufficient funds
    let result = await stickyStacker1.stackIncrease(deployer, 100);
    result.expectErr().expectUint(1);

    result = await stickyCore.deposit(deployer, 150000);
    result.expectOk().expectUintWithDecimals(150000);

    // Nothing locked
    result = await stickyStacker1.stackIncrease(deployer, 100);
    result.expectErr().expectUint(27);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "stacker: only protocol can initiate stacking, only if protocol enabled, with correct reserve",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);

    let result = await stickyStacker1.initiateStacking(wallet_1, 125000, 0, 1);
    result.expectErr().expectUint(20003);

    let block = chain.mineBlock([
      Tx.contractCall("sticky-stacker-1", "initiate-stacking", [
        types.principal(qualifiedName("fake-reserve")),
        types.tuple({ 'version': '0x00', 'hashbytes': '0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac'}),
        types.uint(100 * 1000000),
        types.uint(0), 
        types.uint(1) 
      ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(20003);

    // Set protocol is inactive
    result = await stickyDao.setContractsEnabled(deployer, false);
    result.expectOk().expectBool(true);

    result = await stickyStacker1.initiateStacking(deployer, 125000, 0, 1);
    result.expectErr().expectUint(20002);
  }
});

Clarinet.test({
  name: "stacker: only protocol can increase stacking, only if protocol enabled, with correct reserve",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);

    let result = await stickyStacker1.stackIncrease(wallet_1, 125000);
    result.expectErr().expectUint(20003);

    let block = chain.mineBlock([
      Tx.contractCall("sticky-stacker-1", "stack-increase", [
        types.principal(qualifiedName("fake-reserve")),
        types.uint(100 * 1000000)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(20003);

    // Set protocol is inactive
    result = await stickyDao.setContractsEnabled(deployer, false);
    result.expectOk().expectBool(true);

    result = await stickyStacker1.stackIncrease(deployer, 125000);
    result.expectErr().expectUint(20002);
  }
});

Clarinet.test({
  name: "stacker: only protocol can extend stacking, only if protocol enabled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);

    let result = await stickyStacker1.stackExtend(wallet_1, 1);
    result.expectErr().expectUint(20003);

    // Set protocol is inactive
    result = await stickyDao.setContractsEnabled(deployer, false);
    result.expectOk().expectBool(true);

    result = await stickyStacker1.stackExtend(deployer, 1);
    result.expectErr().expectUint(20002);
  }
});

Clarinet.test({
  name: "stacker: can only return STX if protocol enabled, with correct reserve",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyDao = new StickyDAO(chain, deployer);
    let stickyStacker1 = new StickyStacker1(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall("sticky-stacker-1", "return-stx", [
        types.principal(qualifiedName("fake-reserve")),
      ], wallet_1.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(20003);

    // Set protocol is inactive
    let result = await stickyDao.setContractsEnabled(deployer, false);
    result.expectOk().expectBool(true);

    result = await stickyStacker1.returnStx(deployer);
    result.expectErr().expectUint(20002);
  }
});
