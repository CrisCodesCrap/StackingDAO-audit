import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";

import { StickyCore } from './helpers/sticky-core-helpers.ts';
import { StickyReserve } from './helpers/sticky-reserve-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "reserve: lock and request STX for withdrawal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);

    // Add 1000 STX to reserve
    let result = await stickyCore.deposit(deployer, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000000);

    // Lock 200 STX for withdrawal
    result = await stickyReserve.lockStxForWithdrawal(deployer, 200);
    result.expectOk().expectUintWithDecimals(200);

    // Request 200 STX for wallet_1
    result = await stickyReserve.requestStxForWithdrawal(deployer, 200, wallet_1.address);
    result.expectOk().expectUintWithDecimals(200);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(800);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(800);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000200);
  }
});

Clarinet.test({
  name: "reserve: request STX to stack and return STX from stacking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyReserve = new StickyReserve(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);

    // Add 1000 STX to reserve
    let result = await stickyCore.deposit(deployer, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);

    // Request 200 STX to stack
    result = await stickyReserve.requestStxToStack(deployer, 200);
    result.expectOk().expectUintWithDecimals(200);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(800);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(200);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);

    // Return 100 STX from stacking
    result = await stickyReserve.returnStxFromStacking(deployer, 100);
    result.expectOk().expectUintWithDecimals(100);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(900);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(100);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);
  }
});


Clarinet.test({
  name: "reserve: protocol can get STX",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);

    // Add 1000 STX to reserve
    let result = await stickyCore.deposit(deployer, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000000);

    // Get 200 STX
    result = await stickyReserve.getStx(deployer, 200, wallet_1.address);
    result.expectOk().expectUintWithDecimals(200);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000000 + 200);

    call = await stickyReserve.getStxBalance();
    call.result.expectOk().expectUintWithDecimals(800);

    call = await stickyReserve.getStxStacking();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(800);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "reserve: only protocol can lock and request STX for withdrawal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);

    let result = await stickyReserve.lockStxForWithdrawal(wallet_1, 100);
    result.expectErr().expectUint(20003);

    result = await stickyReserve.requestStxForWithdrawal(wallet_1, 100, wallet_1.address);
    result.expectErr().expectUint(20003);
  }
});

Clarinet.test({
  name: "reserve: only protocol can request STX to stack and return STX",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);

    let result = await stickyReserve.requestStxToStack(wallet_1, 100);
    result.expectErr().expectUint(20003);

    result = await stickyReserve.returnStxFromStacking(wallet_1, 100);
    result.expectErr().expectUint(20003);
  }
});

Clarinet.test({
  name: "reserve: only protocol can get STX",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);

    let result = await stickyReserve.getStx(wallet_1, 100, wallet_1.address);
    result.expectErr().expectUint(20003);
  }
});
