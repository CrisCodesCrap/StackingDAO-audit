import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/sticky-tests-utils.ts";

import { StickyDAO } from './helpers/sticky-dao-helpers.ts';
import { StickyStaking } from './helpers/sticky-staking-helpers.ts';
import { StickyCore } from './helpers/sticky-core-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "staking: can stake and unstake, variables are updated",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyStaking = new StickyStaking(chain, deployer);

    let result = await stickyStaking.stake(wallet_1, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stickyStaking.getStakeAmountOf(wallet_1.address);
    call.result.expectUintWithDecimals(1000);

    call = await stickyStaking.getTotalStaked();
    call.result.expectUintWithDecimals(1000);

    call = await stickyStaking.getStakeOf(wallet_1.address)
    call.result.expectTuple()["amount"].expectUintWithDecimals(1000);

    result = await stickyStaking.unstake(wallet_1, 800);
    result.expectOk().expectUintWithDecimals(800);

    call = await stickyStaking.getStakeAmountOf(wallet_1.address);
    call.result.expectUintWithDecimals(200);

    call = await stickyStaking.getTotalStaked();
    call.result.expectUintWithDecimals(200);

    call = await stickyStaking.getStakeOf(wallet_1.address)
    call.result.expectTuple()["amount"].expectUintWithDecimals(200);
  }
});

Clarinet.test({
  name: "staking: stake and unstake next block",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyStaking = new StickyStaking(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);

    // 2100 STX so 1 STX per block
    let result = await stickyStaking.addRewards(deployer, 2100);
    result.expectOk().expectUintWithDecimals(2100);

    result = await stickyStaking.stake(wallet_1, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stickyCore.getStxBalance(wallet_2.address);
    call.result.expectUintWithDecimals(100000000);

    result = await stickyStaking.stake(wallet_2, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    // Got half of 1 block rewards
    call = await stickyStaking.getPendingRewards(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(0.5);

    result = await stickyStaking.unstake(wallet_2, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    // Got rewards
    call = await stickyCore.getStxBalance(wallet_2.address);
    call.result.expectUintWithDecimals(100000000.5);
  }
});

Clarinet.test({
  name: "staking: add and claim rewards",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;
    let wallet_3 = accounts.get("wallet_3")!;

    let stickyStaking = new StickyStaking(chain, deployer);
    let stickyCore = new StickyCore(chain, deployer);

    let result = await stickyStaking.stake(wallet_1, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    result = await stickyStaking.stake(wallet_2, 2000);
    result.expectOk().expectUintWithDecimals(2000);

    result = await stickyStaking.stake(wallet_3, 3000);
    result.expectOk().expectUintWithDecimals(3000);

    result = await stickyStaking.addRewards(deployer, 100);
    result.expectOk().expectUintWithDecimals(100);

    // 100 STX per 2100 blocks = 0.047619 STX per block
    let call = await stickyStaking.getRewardsPerBlock();
    call.result.expectUintWithDecimals(0.047619);

    // Advance half cycle
    chain.mineEmptyBlock(1050);

    // 50 STX * 16.66% = 8.3 STX
    call = await stickyStaking.getPendingRewards(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(8.341);

    // 50 STX * 33.33% = 8.3 STX
    call = await stickyStaking.getPendingRewards(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(16.682);

    // 50 STX * 50% = 25 STX
    call = await stickyStaking.getPendingRewards(wallet_3.address);
    call.result.expectOk().expectUintWithDecimals(25.023);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000000);

    result = await stickyStaking.claimPendingRewards(wallet_1);
    result.expectOk().expectUintWithDecimals(8.341);

    call = await stickyCore.getStxBalance(wallet_1.address);
    call.result.expectUintWithDecimals(100000008.341);

    call = await stickyCore.getStxBalance(wallet_2.address);
    call.result.expectUintWithDecimals(100000000);

    result = await stickyStaking.claimPendingRewards(wallet_2);
    result.expectOk().expectUintWithDecimals(16.696);

    call = await stickyCore.getStxBalance(wallet_2.address);
    call.result.expectUintWithDecimals(100000016.696);

    result = await stickyStaking.claimPendingRewards(wallet_3);
    result.expectOk().expectUintWithDecimals(25.065);
  }
});

Clarinet.test({
  name: "staking: reward tracking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyStaking = new StickyStaking(chain, deployer);

    // Cumm reward per stake still 0
    let call = await stickyStaking.getCummRewardPerStake();
    call.result.expectUintWithDecimals(0);

    let result = await stickyStaking.calculateCummRewardPerStake(deployer);
    result.expectOk().expectUintWithDecimals(0);

    // Last increase block
    call = stickyStaking.getLastRewardIncreaseBlock();
    call.result.expectUint(0);

    // Pending rewards should be 0
    call = await stickyStaking.getPendingRewards(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(0);

    // Initial stake should be 0
    call = await stickyStaking.getStakeAmountOf(wallet_1.address);
    call.result.expectUintWithDecimals(0);

    call = await stickyStaking.getTotalStaked();
    call.result.expectUintWithDecimals(0);

    // Stake 1000 STX
    result = await stickyStaking.stake(wallet_1, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    // Last increase block
    call = stickyStaking.getLastRewardIncreaseBlock();
    call.result.expectUint(3);

    // New stake amounts
    call = await stickyStaking.getStakeAmountOf(wallet_1.address);
    call.result.expectUintWithDecimals(1000);

    call = await stickyStaking.getTotalStaked();
    call.result.expectUintWithDecimals(1000);

    // Not advanced blocks yet.  
    call = await stickyStaking.getCummRewardPerStake();
    call.result.expectUintWithDecimals(0);

    // Add 2100 STX, which is 1 STX per block
    result = await stickyStaking.addRewards(deployer, 2100);
    result.expectOk().expectUintWithDecimals(2100);

    // 1 STX reward per block, over 1000 STX staked = 0.001 STX rewards per STX staked
    result = await stickyStaking.calculateCummRewardPerStake(deployer);
    result.expectOk().expectUintWithDecimals(0.001);

    // Start at 0
    call = stickyStaking.getStakeCummRewardPerStakeOf(wallet_1.address);
    call.result.expectUintWithDecimals(0);

    // Advanced 1 block after staking (because of adding rewards)
    // Taking into account the extra block, so 2 STX rewards
    call = stickyStaking.getPendingRewards(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(2);

    // Advance 3 blocks
    chain.mineEmptyBlock(3);

    // Total stake did not change, so cumm reward per stake should not change either
    call = stickyStaking.getCummRewardPerStake();
    call.result.expectUintWithDecimals(0);

    // Advanced 5 blocks. 
    // 5 blocks / 1000 STX staked = 0.005
    result = await stickyStaking.calculateCummRewardPerStake(deployer);
    result.expectOk().expectUintWithDecimals(0.005);

    // Advanced 5 blocks, taking into account 1 extra block
    // 6 blocks * 1 STX = 6 STX
    call = stickyStaking.getPendingRewards(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(6);

    // Stake with wallet_2
    result = await stickyStaking.stake(wallet_2, 2000);
    result.expectOk().expectUintWithDecimals(2000);

    // Total staked
    call = await stickyStaking.getTotalStaked();
    call.result.expectUintWithDecimals(3000);

    // Cummulative reward per stake was 0.005
    // One extra block so becomes 0.006 (1 STX / 1000 STX extra)
    call = stickyStaking.getStakeCummRewardPerStakeOf(wallet_2.address);
    call.result.expectUintWithDecimals(0.006);

    // Should be same as previous check (get-stake-cumm-reward-per-stake-of)
    call = await stickyStaking.getCummRewardPerStake();
    call.result.expectUintWithDecimals(0.006);

    // Started with 0.006
    // Adding (1 STX per block / 3000 STX staked) = 0.000333
    result = await stickyStaking.increaseCummRewardPerStake(deployer);
    result.expectOk().expectUintWithDecimals(0.006333);

    // Wallet_1 has 33%, so gets 33% of 1 STX
    // For 2 blocks that's 0.666 STX extra
    call = stickyStaking.getPendingRewards(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(6.666);

    // Wallet_2 has 66%, so gets 66% of 1 STX
    // For 2 blocks that's 1.333 STX extra
    call = stickyStaking.getPendingRewards(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(1.332);

    // Unstake 700 STX
    result = stickyStaking.unstake(wallet_1, 700);
    result.expectOk().expectUintWithDecimals(700);

    // Last increase block
    call = stickyStaking.getLastRewardIncreaseBlock();
    call.result.expectUint(12);

    // New cumm reward per stake
    // Was 0.006333, adding 0.000333 (1 STX per block / 3000 STX staked)
    call = stickyStaking.getCummRewardPerStake();
    call.result.expectUintWithDecimals(0.006666);

    // New cumm reward per stake
    // Was 0.006666, adding 0.000434 (1 STX per block / 2300 STX staked)
    result = await stickyStaking.calculateCummRewardPerStake(deployer);
    result.expectOk().expectUintWithDecimals(0.0071);
  }
});

Clarinet.test({
  name: "staking: calculate rewards per block again if rewards added",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStaking = new StickyStaking(chain, deployer);

    // Add 2100 STX, so 1 STX per block
    let result = await stickyStaking.addRewards(deployer, 2100);
    result.expectOk().expectUintWithDecimals(2100);

    let call = await stickyStaking.getRewardsPerBlock();
    call.result.expectUintWithDecimals(1);

    // Add 1050 STX, which is 0.5 STX per block
    result = await stickyStaking.addRewards(deployer, 1050);
    result.expectOk().expectUintWithDecimals(1050);

    // Total is now 1.5 STX per block
    call = await stickyStaking.getRewardsPerBlock();
    call.result.expectUintWithDecimals(1.5);
  }
});

//-------------------------------------
// Errors 
//-------------------------------------

Clarinet.test({
  name: "staking: can not stake/unstake with wrong token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall("sticky-staking-v1", "stake", [
        types.principal(qualifiedName("ststx-token")),
        types.uint(10 * 1000000),
      ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(12002);

    block = chain.mineBlock([
      Tx.contractCall("sticky-staking-v1", "unstake", [
        types.principal(qualifiedName("ststx-token")),
        types.uint(10 * 1000000),
      ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(12002);
  }
});

Clarinet.test({
  name: "staking: can not unstake more than staked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStaking = new StickyStaking(chain, deployer);

    let result = await stickyStaking.stake(deployer, 1000);
    result.expectOk().expectUintWithDecimals(1000);

    result = await stickyStaking.unstake(deployer, 1001);
    result.expectErr().expectUint(12003);
  }
});

Clarinet.test({
  name: "staking: can not stake, unstake or claim pending rewards when protocol disabled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyStaking = new StickyStaking(chain, deployer);
    let stickyDao = new StickyDAO(chain, deployer);

    let result = await stickyDao.setContractsEnabled(deployer, false);
    result.expectOk().expectBool(true);

    result = await stickyStaking.stake(deployer, 1000);
    result.expectErr().expectUint(20002);

    result = await stickyStaking.unstake(deployer, 1001);
    result.expectErr().expectUint(20002);

    result = await stickyStaking.claimPendingRewards(deployer);
    result.expectErr().expectUint(20002);
  }
});
