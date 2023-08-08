import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";

import { StickyCore } from './helpers/sticky-core-helpers.ts';
import { StickyCommission } from './helpers/sticky-commission-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "commission: can add and withdraw commission",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyCore = new StickyCore(chain, deployer);
    let stickyCommission = new StickyCommission(chain, deployer);

    let call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000000);

    let result = await stickyCommission.addCommission(wallet_1, 5000);
    result.expectOk().expectUintWithDecimals(5000);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(99995000);

    call = await stickyCore.getStxBalance(deployer.address);
    call.result.expectUintWithDecimals(100000000);

    // Can withdraw 20% of total commission
    // 20% of 5000 STX = 1000 STX
    result = await stickyCommission.withdrawCommission(deployer);
    result.expectOk().expectUintWithDecimals(1000);

    call = await stickyCore.getStxBalance(deployer.address);
    call.result.expectUintWithDecimals(100001000);
  }
});

Clarinet.test({
  name: "commission: can set staking percentage",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyCore = new StickyCore(chain, deployer);
    let stickyCommission = new StickyCommission(chain, deployer);

    let result = await stickyCommission.addCommission(wallet_1, 5000);
    result.expectOk().expectUintWithDecimals(5000);

    // Can withdraw 20% of total commission
    // 20% of 5000 STX = 1000 STX
    result = await stickyCommission.withdrawCommission(deployer);
    result.expectOk().expectUintWithDecimals(1000);

    result = await stickyCommission.setStakingPercentage(deployer, 0.2);
    result.expectOk().expectBool(true);

    result = await stickyCommission.addCommission(wallet_1, 5000);
    result.expectOk().expectUintWithDecimals(5000);

    // Can withdraw 80% of total commission
    // 80% of 5000 STX = 1000 STX
    result = await stickyCommission.withdrawCommission(deployer);
    result.expectOk().expectUintWithDecimals(4000);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "commission: only protocol can withdraw commission",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyCommission = new StickyCommission(chain, deployer);

    let result = await stickyCommission.withdrawCommission(wallet_1);
    result.expectErr().expectUint(20003);
  }
});

Clarinet.test({
  name: "commission: only protocol can set staking percentage",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyCommission = new StickyCommission(chain, deployer);

    let result = await stickyCommission.setStakingPercentage(wallet_1, 10);
    result.expectErr().expectUint(20003);
  }
});
