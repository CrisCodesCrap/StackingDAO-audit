import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/sticky-tests-utils.ts";
qualifiedName("")

import { StickyToken } from './helpers/sticky-token-helpers.ts';
import { StickyTax } from './helpers/sticky-tax-helpers.ts';

//-------------------------------------
// Tax 
//-------------------------------------

Clarinet.test({
  name: "sticky-tax: handle tax and retreive",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyToken = new StickyToken(chain, deployer);
    let stickyTax = new StickyTax(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stickyToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // Handle - no taxes yet
    // Anyone can call this method
    result = await stickyTax.handleTax(wallet_2);
    result.expectOk().expectUintWithDecimals(0);

    // Sell = transfer from user to AMM
    result = await stickyToken.transfer(wallet_2, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    // Got 4 in taxes
    let call = await stickyToken.getTaxBalance();
    call.result.expectUintWithDecimals(4);

    // Handle
    result = await stickyTax.handleTax(deployer);
    result.expectOk().expectUintWithDecimals(4);

    call = await stickyToken.getBalance(qualifiedName("sticky-tax-v1"));
    call.result.expectOk().expectUintWithDecimals(4);

    call = await stickyToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000);

    // Retreive
    result = await stickyTax.retreiveTokens(deployer);
    result.expectOk().expectUintWithDecimals(4);

    call = await stickyToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000 + 4);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "sticky-tax: only protocol can retreive tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyTax = new StickyTax(chain, deployer);

    let result = await stickyTax.retreiveTokens(wallet_1);
    result.expectErr().expectUint(20003);
  }
});