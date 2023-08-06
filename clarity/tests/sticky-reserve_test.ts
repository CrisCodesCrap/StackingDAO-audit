import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";

import { StickyCore } from './helpers/sticky-core-helpers.ts';
import { StickyReserve } from './helpers/sticky-reserve-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "reserve: request STX",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);

    // Add 1000 STX to reserve
    let result = await stickyCore.deposit(deployer, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stickyReserve.getStxIdle();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyReserve.getStxInUse();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000000);

    // Request 200 STX for wallet_1
    result = await stickyReserve.requestStx(deployer, 200, wallet_1.address);
    result.expectOk().expectUintWithDecimals(200);

    call = await stickyReserve.getStxIdle();
    call.result.expectOk().expectUintWithDecimals(800);

    call = await stickyReserve.getStxInUse();
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

    let call = await stickyReserve.getStxIdle();
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await stickyReserve.getStxInUse();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);

    // Request 200 STX to stack
    result = await stickyReserve.requestStxToStack(deployer, 200);
    result.expectOk().expectUintWithDecimals(200);

    call = await stickyReserve.getStxIdle();
    call.result.expectOk().expectUintWithDecimals(800);

    call = await stickyReserve.getStxInUse();
    call.result.expectOk().expectUintWithDecimals(200);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);

    // Return 100 STX from stacking
    result = await stickyReserve.returnStxFromStacking(deployer, 100);
    result.expectOk().expectUintWithDecimals(100);

    call = await stickyReserve.getStxIdle();
    call.result.expectOk().expectUintWithDecimals(900);

    call = await stickyReserve.getStxInUse();
    call.result.expectOk().expectUintWithDecimals(100);

    call = await stickyReserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(1000);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "reserve: only protocol can request STX",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);

    let result = await stickyReserve.requestStx(wallet_1, 100, wallet_1.address);
    result.expectErr().expectUint(20003)
  }
});

Clarinet.test({
  name: "reserve: only protocol can request STX to stack",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);

    let result = await stickyReserve.requestStxToStack(wallet_1, 100);
    result.expectErr().expectUint(20003)
  }
});

Clarinet.test({
  name: "reserve: only protocol can return STX from stacking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyReserve = new StickyReserve(chain, deployer);

    let result = await stickyReserve.returnStxFromStacking(wallet_1, 100);
    result.expectErr().expectUint(20003)
  }
});
