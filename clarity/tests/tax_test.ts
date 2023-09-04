import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/tests-utils.ts";
qualifiedName("")

import { STDAOToken } from './helpers/stdao-token-helpers.ts';
import { Tax } from './helpers/tax-helpers.ts';

//-------------------------------------
// Tax 
//-------------------------------------

Clarinet.test({
  name: "tax: handle tax and retreive",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);
    let tax = new Tax(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stDaoToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // Handle - no taxes yet
    result = await tax.handleTax(wallet_2);
    result.expectErr().expectUint(2101);

    // Sell = transfer from user to AMM
    result = await stDaoToken.transfer(wallet_2, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    // Got 4 in taxes
    let call = await stDaoToken.getTaxBalance();
    call.result.expectUintWithDecimals(4);

    // Handle
    result = await tax.handleTax(deployer);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getBalance(qualifiedName("tax-v1"));
    call.result.expectOk().expectUintWithDecimals(4);

    call = await stDaoToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000);

    // Retreive
    result = await tax.retreiveTokens(deployer);
    result.expectOk().expectUintWithDecimals(4);

    call = await stDaoToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000 + 4);
  }
});

//-------------------------------------
// Keeper 
//-------------------------------------

Clarinet.test({
  name: "tax: keeper functions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let tax = new Tax(chain, deployer);
    let stDaoToken = new STDAOToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stDaoToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);
    
    let call = await tax.checkJob();
    call.result.expectOk().expectBool(false);

    result = await tax.initialize(deployer);
    result.expectOk().expectBool(true);

    result = await tax.runJob(deployer);
    result.expectErr().expectUint(2101);

    result = await stDaoToken.transfer(wallet_2, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getTaxBalance();
    call.result.expectUintWithDecimals(4);

    call = await tax.checkJob();
    call.result.expectOk().expectBool(true);

    result = await tax.runJob(deployer);
    result.expectOk().expectBool(true);
  }
});

//-------------------------------------
// Admin 
//-------------------------------------

Clarinet.test({
  name: "tax: protocol can set min amount to handle",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let tax = new Tax(chain, deployer);

    let result = await tax.setMinBalanceToHandle(deployer, 500);
    result.expectOk().expectBool(true);

    let call = await tax.getMinBalanceToHandle();
    call.result.expectUintWithDecimals(500);
  }
});

Clarinet.test({
  name: "tax: protocol can set percentage to swap",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let tax = new Tax(chain, deployer);

    let result = await tax.setPercentageToSwap(deployer, 0.2);
    result.expectOk().expectBool(true);

    let call = await tax.getPercentageToSwap();
    call.result.expectUint(0.2 * 10000);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "tax: only protocol can retreive tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let tax = new Tax(chain, deployer);

    let result = await tax.retreiveTokens(wallet_1);
    result.expectErr().expectUint(20003);
  }
});

Clarinet.test({
  name: "tax: only protocol can set min amount to handle and percentage to swap",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let tax = new Tax(chain, deployer);

    let result = await tax.setMinBalanceToHandle(wallet_1, 500);
    result.expectErr().expectUint(20003);

    result = await tax.setPercentageToSwap(wallet_1, 0.2);
    result.expectErr().expectUint(20003);
  }
});
