import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "../wrappers/tests-utils.ts";

import { Rewards } from '../wrappers/rewards-helpers.ts';
import { Reserve } from '../wrappers/reserve-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "rewards: add rewards and process",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let rewards = new Rewards(chain, deployer);
    let reserve = new Reserve(chain, deployer);

    let call = await rewards.getTotalCommission();
    call.result.expectUintWithDecimals(0);
    call = await rewards.getTotalRewardsLeft();
    call.result.expectUintWithDecimals(0);
    
    let result = await rewards.addRewards(deployer, qualifiedName("stacking-pool-v1"), 100);
    result.expectOk().expectBool(true);

    call = await rewards.getTotalCommission();
    call.result.expectUintWithDecimals(5);
    call = await rewards.getTotalRewardsLeft();
    call.result.expectUintWithDecimals(95);

    result = await rewards.processRewards(deployer);
    result.expectOk().expectBool(true);

    call = await rewards.getTotalCommission();
    call.result.expectUintWithDecimals(0);
    call = await rewards.getTotalRewardsLeft();
    call.result.expectUintWithDecimals(0);

    call = await reserve.getTotalStx();
    call.result.expectOk().expectUintWithDecimals(95);
  }
});

//-------------------------------------
// Errors 
//-------------------------------------

//-------------------------------------
// Access 
//-------------------------------------
