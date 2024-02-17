import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName, REWARD_CYCLE_LENGTH, PREPARE_PHASE_LENGTH } from '../wrappers/tests-utils.ts';

import { Core} from '../wrappers/stacking-dao-core-helpers.ts';
import { DataCore } from '../wrappers/data-core-helpers.ts';
import { DataDirectStacking } from '../wrappers/data-direct-stacking-helpers.ts';
import { Reserve } from '../wrappers/reserve-helpers.ts';
import { StStxToken } from '../wrappers/ststx-token-helpers.ts';

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "core: deposit and withdraw for normal stacking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let core = new Core(chain, deployer);
    let dataCore = new DataCore(chain, deployer);
    let reserve = new Reserve(chain, deployer);

    let result = await core.deposit(wallet_1, 1000, undefined, undefined);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await reserve.getTotalStx()
    call.result.expectOk().expectUintWithDecimals(1000);
    call = await reserve.getStxForWithdrawals();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await core.getWithdrawUnlockBurnHeight();
    call.result.expectOk().expectUint(21);

    result = await core.initWithdraw(wallet_1, 200);
    result.expectOk().expectUint(0);

    call = await reserve.getTotalStx()
    call.result.expectOk().expectUintWithDecimals(1000);
    call = await reserve.getStxForWithdrawals();
    call.result.expectOk().expectUintWithDecimals(200);

    call = await dataCore.getWithdrawalsByNft(0);
    call.result.expectTuple()["ststx-amount"].expectUintWithDecimals(200);
    call.result.expectTuple()["stx-amount"].expectUintWithDecimals(200);
    call.result.expectTuple()["unlock-burn-height"].expectUint(21);

    chain.mineEmptyBlockUntil(21 + 2);

    result = await core.withdraw(wallet_1, 0);
    result.expectOk().expectUintWithDecimals(200);

    call = await reserve.getTotalStx()
    call.result.expectOk().expectUintWithDecimals(800);
    call = await reserve.getStxForWithdrawals();
    call.result.expectOk().expectUintWithDecimals(0);
  },
});

Clarinet.test({
  name: "core: deposit and withdraw for direct stacking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let core = new Core(chain, deployer);
    let dataCore = new DataCore(chain, deployer);
    let dataDirectStacking = new DataDirectStacking(chain, deployer);
    let reserve = new Reserve(chain, deployer);

    let result = await core.deposit(wallet_1, 1000, undefined, qualifiedName("stacking-pool-v1"));
    result.expectOk().expectUintWithDecimals(1000);

    let call = await reserve.getTotalStx()
    call.result.expectOk().expectUintWithDecimals(1000);
    call = await reserve.getStxForWithdrawals();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await dataDirectStacking.getTotalDirectStacking()
    call.result.expectUintWithDecimals(1000);
    call = await dataDirectStacking.getDirectStackingPoolAmount(qualifiedName("stacking-pool-v1"))
    call.result.expectUintWithDecimals(1000);
    call = await dataDirectStacking.getDirectStackingUser(wallet_1.address);
    call.result.expectSome().expectTuple()["amount"].expectUintWithDecimals(1000);
    call.result.expectSome().expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"));


    call = await core.getWithdrawUnlockBurnHeight();
    call.result.expectOk().expectUint(21);

    result = await core.initWithdraw(wallet_1, 200);
    result.expectOk().expectUint(0);

    call = await reserve.getTotalStx()
    call.result.expectOk().expectUintWithDecimals(1000);
    call = await reserve.getStxForWithdrawals();
    call.result.expectOk().expectUintWithDecimals(200);

    call = await dataDirectStacking.getTotalDirectStacking()
    call.result.expectUintWithDecimals(800);
    call = await dataDirectStacking.getDirectStackingPoolAmount(qualifiedName("stacking-pool-v1"))
    call.result.expectUintWithDecimals(800);
    call = await dataDirectStacking.getDirectStackingUser(wallet_1.address);
    call.result.expectSome().expectTuple()["amount"].expectUintWithDecimals(800);
    call.result.expectSome().expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"));


    call = await dataCore.getWithdrawalsByNft(0);
    call.result.expectTuple()["ststx-amount"].expectUintWithDecimals(200);
    call.result.expectTuple()["stx-amount"].expectUintWithDecimals(200);
    call.result.expectTuple()["unlock-burn-height"].expectUint(21);

    chain.mineEmptyBlockUntil(21 + 2);

    result = await core.withdraw(wallet_1, 0);
    result.expectOk().expectUintWithDecimals(200);

    call = await reserve.getTotalStx()
    call.result.expectOk().expectUintWithDecimals(800);
    call = await reserve.getStxForWithdrawals();
    call.result.expectOk().expectUintWithDecimals(0);

    call = await dataDirectStacking.getTotalDirectStacking()
    call.result.expectUintWithDecimals(800);
    call = await dataDirectStacking.getDirectStackingPoolAmount(qualifiedName("stacking-pool-v1"))
    call.result.expectUintWithDecimals(800);
    call = await dataDirectStacking.getDirectStackingUser(wallet_1.address);
    call.result.expectSome().expectTuple()["amount"].expectUintWithDecimals(800);
    call.result.expectSome().expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"));
  },
});

Clarinet.test({
  name: "core: withdraw at end of cycle",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let core = new Core(chain, deployer);
    let dataCore = new DataCore(chain, deployer);

    let result = await core.deposit(wallet_1, 1000, undefined, undefined);
    result.expectOk().expectUintWithDecimals(1000);

    chain.mineEmptyBlockUntil(19);

    let call = await core.getWithdrawUnlockBurnHeight();
    call.result.expectOk().expectUint(21 * 2);

    result = await core.initWithdraw(wallet_1, 200);
    result.expectOk().expectUint(0);

    call = await dataCore.getWithdrawalsByNft(0);
    call.result.expectTuple()["ststx-amount"].expectUintWithDecimals(200);
    call.result.expectTuple()["stx-amount"].expectUintWithDecimals(200);
    call.result.expectTuple()["unlock-burn-height"].expectUint(42);

    chain.mineEmptyBlockUntil(21 * 2 + 2);

    result = await core.withdraw(wallet_1, 0);
    result.expectOk().expectUintWithDecimals(200);
  },
});
  
Clarinet.test({
  name: "core: cancel withdrawal while normal stacking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let core = new Core(chain, deployer);
    let dataCore = new DataCore(chain, deployer);
    let stStxToken = new StStxToken(chain, deployer);

    let result = await core.deposit(wallet_1, 1000, undefined, undefined);
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stStxToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await core.getWithdrawUnlockBurnHeight();
    call.result.expectOk().expectUint(21);

    result = await core.initWithdraw(wallet_1, 200);
    result.expectOk().expectUint(0);

    call = await stStxToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(800);

    result = await core.cancelWithdraw(wallet_1, 0, undefined);
    result.expectOk().expectUintWithDecimals(200);

    call = await stStxToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await dataCore.getWithdrawalsByNft(0);
    call.result.expectTuple()["ststx-amount"].expectUintWithDecimals(0);
    call.result.expectTuple()["stx-amount"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-burn-height"].expectUint(0);

    chain.mineEmptyBlockUntil(21 * 2 + 2);

    // Can not withdraw as NFT does not exist
    result = await core.withdraw(wallet_1, 0);
    result.expectErr().expectUint(19005);
  },
});

Clarinet.test({
  name: "core: cancel withdrawal while direct stacking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
  
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let core = new Core(chain, deployer);
    let dataCore = new DataCore(chain, deployer);
    let stStxToken = new StStxToken(chain, deployer);
    let dataDirectStacking = new DataDirectStacking(chain, deployer);

    let result = await core.deposit(wallet_1, 1000, undefined, qualifiedName("stacking-pool-v1"));
    result.expectOk().expectUintWithDecimals(1000);

    let call = await stStxToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await core.getWithdrawUnlockBurnHeight();
    call.result.expectOk().expectUint(21);

    result = await core.initWithdraw(wallet_1, 200);
    result.expectOk().expectUint(0);

    call = await stStxToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(800);

    call = await dataDirectStacking.getTotalDirectStacking()
    call.result.expectUintWithDecimals(800);
    call = await dataDirectStacking.getDirectStackingPoolAmount(qualifiedName("stacking-pool-v1"))
    call.result.expectUintWithDecimals(800);
    call = await dataDirectStacking.getDirectStackingUser(wallet_1.address);
    call.result.expectSome().expectTuple()["amount"].expectUintWithDecimals(800);
    call.result.expectSome().expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"));

    result = await core.cancelWithdraw(wallet_1, 0, qualifiedName("stacking-pool-v1"));
    result.expectOk().expectUintWithDecimals(200);

    call = await stStxToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(1000);

    call = await dataDirectStacking.getTotalDirectStacking()
    call.result.expectUintWithDecimals(1000);
    call = await dataDirectStacking.getDirectStackingPoolAmount(qualifiedName("stacking-pool-v1"))
    call.result.expectUintWithDecimals(1000);
    call = await dataDirectStacking.getDirectStackingUser(wallet_1.address);
    call.result.expectSome().expectTuple()["amount"].expectUintWithDecimals(1000);
    call.result.expectSome().expectTuple()["pool"].expectPrincipal(qualifiedName("stacking-pool-v1"));

    call = await dataCore.getWithdrawalsByNft(0);
    call.result.expectTuple()["ststx-amount"].expectUintWithDecimals(0);
    call.result.expectTuple()["stx-amount"].expectUintWithDecimals(0);
    call.result.expectTuple()["unlock-burn-height"].expectUint(0);

    chain.mineEmptyBlockUntil(21 * 2 + 2);

    // Can not withdraw as NFT does not exist
    result = await core.withdraw(wallet_1, 0);
    result.expectErr().expectUint(19005);
  },
});

//-------------------------------------
// Admin 
//-------------------------------------

Clarinet.test({
  name: "core: admin can shutdown deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
  
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let core = new Core(chain, deployer);

    let result = await core.deposit(wallet_1, 1000, undefined, qualifiedName("stacking-pool-v1"));
    result.expectOk().expectUintWithDecimals(1000);

    result = await core.setShutdownDeposits(deployer, true);
    result.expectOk().expectBool(true);

    result = await core.deposit(wallet_1, 1000, undefined, qualifiedName("stacking-pool-v1"));
    result.expectErr().expectUint(19002);

    result = await core.setShutdownDeposits(deployer, false);
    result.expectOk().expectBool(true);

    result = await core.deposit(wallet_1, 1000, undefined, qualifiedName("stacking-pool-v1"));
    result.expectOk().expectUintWithDecimals(1000);
  },
});


//-------------------------------------
// Access 
//-------------------------------------

// TODO: set-shutdown-deposits

//-------------------------------------
// Errors 
//-------------------------------------

// TODO:
// (define-constant ERR_WITHDRAW_LOCKED u19001)
// (define-constant ERR_SHUTDOWN u19002)
// (define-constant ERR_WITHDRAW_NOT_NFT_OWNER u19004)
// (define-constant ERR_WITHDRAW_NFT_DOES_NOT_EXIST u19005)
// (define-constant ERR_GET_OWNER u19006)




//-------------------------------------
// V1 
//-------------------------------------

// from V1:

// Clarinet.test({
//     name: "core-v1: test deposit, STX to stSTX ratio and withdrawals",
//     async fn(chain: Chain, accounts: Map<string, Account>) {
//       let deployer = accounts.get("deployer")!;
//       let wallet_1 = accounts.get("wallet_1")!;
//       let wallet_2 = accounts.get("wallet_2")!;
  
//       let core = new Core(chain, deployer);
  
//       // Set commission to 0 so it does not influence STX per stSTX
//       let result = await core.setCommission(deployer, 0);
//       result.expectOk().expectBool(true);
  
//       // Deposit 1,000,000 STX
//       result = await core.deposit(deployer, 1000000);
//       result.expectOk().expectUintWithDecimals(1000000);
  
//       // Got 1,000,000 stSTX
//       let call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
//         types.principal(deployer.address),
//       ], wallet_1.address);
//       call.result.expectOk().expectUintWithDecimals(1000000);
  
//       // Advance to next cycle
//       chain.mineEmptyBlock(REWARD_CYCLE_LENGTH + 1);
  
//       // Add rewards
//       result = await core.addRewards(wallet_2, 10000, 0);
//       result.expectOk().expectUintWithDecimals(10000);
  
//       // STX per stSTX ratio increased
//       call = await core.getStxPerStstx();
//       call.result.expectOk().expectUintWithDecimals(1.01);
  
//       // Deposit 1M STX
//       result = await core.deposit(wallet_1, 1000000);
//       result.expectOk().expectUintWithDecimals(990099.0099);
  
//       // Advance to next cycle
//       chain.mineEmptyBlock(REWARD_CYCLE_LENGTH + 1);
  
//       // Add rewards
//       result = await core.addRewards(wallet_2, 18000, 1);
//       result.expectOk().expectUintWithDecimals(18000);
  
//       // Now let's see what the stSTX to STX ratio is
//       call = await core.getStxPerStstx();
//       call.result.expectOk().expectUintWithDecimals(1.019044); 
  
//       // Current PoX cycle
//       call = await core.getPoxCycle();
//       call.result.expectUint(2); 
  
//       // Let's test withdrawals
//       // We are in cycle 2, so cycle 3 is the first we can withdraw (hence u5 as second param)
//       result = await core.initWithdraw(deployer, 10000);
//       result.expectOk().expectUint(0);
  
//       // Deployer should have 10k stSTX less
//       call = await chain.callReadOnlyFn("ststx-token", "get-balance", [
//         types.principal(deployer.address),
//       ], wallet_1.address);
//       call.result.expectOk().expectUintWithDecimals(990000);
  
//       // Deployer did not get STX back
//       call = await core.getStxBalance(deployer.address);
//       call.result.expectUintWithDecimals(99000000); // 99M
  
//       // Let's go 1 cycle further now
//       chain.mineEmptyBlock(REWARD_CYCLE_LENGTH + PREPARE_PHASE_LENGTH);
  
//       // Current PoX cycle
//       call = await core.getPoxCycle();
//       call.result.expectUint(3); 
  
//       // Withdraw
//       result = core.withdraw(deployer, 0);
//       result.expectOk().expectUintWithDecimals(10190.44);
  
//       // STX balance
//       call = core.getStxBalance(deployer.address);
//       call.result.expectUintWithDecimals(99010190.44);
  
//       // After deployer pulled all their capital + rewards, the ratio remains the same
//       call = await core.getStxPerStstx();
//       call.result.expectOk().expectUintWithDecimals(1.019044);
//     },
//   });