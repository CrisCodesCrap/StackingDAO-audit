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

    result = await stickyCommission.withdrawCommission(deployer);
    result.expectOk().expectUintWithDecimals(5000);

    call = await stickyCore.getStxBalance(deployer.address);
    call.result.expectUintWithDecimals(100005000);
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
