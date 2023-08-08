import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/sticky-tests-utils.ts";
qualifiedName("")

import { StickyToken } from './helpers/sticky-token-helpers.ts';

//-------------------------------------
// Getters 
//-------------------------------------

Clarinet.test({
  name: "sticky-token: can get token info",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_4 = accounts.get("wallet_4")!;

    let stickyToken = new StickyToken(chain, deployer);

    let call = await stickyToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920000);

    call = await stickyToken.getName();
    call.result.expectOk().expectAscii("Sticky Token");

    call = await stickyToken.getSymbol();
    call.result.expectOk().expectAscii("STICKY");

    call = await stickyToken.getDecimals();
    call.result.expectOk().expectUint(6);

    call = await stickyToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000);

    call = await stickyToken.getBalance(wallet_4.address);
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stickyToken.getTokenUri();
    call.result.expectOk().expectSome().expectUtf8("");
  }
});

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "sticky-token: can mint/burn as protocol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyToken = new StickyToken(chain, deployer);

    let call = await stickyToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920000);

    call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    let result = await stickyToken.mintForSticky(deployer, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    call = await stickyToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920100);

    call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10100);

    result = await stickyToken.burnForSticky(deployer, 20, wallet_1.address);
    result.expectOk().expectBool(true);

    call = await stickyToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920080);

    call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10080);

    result = await stickyToken.burn(wallet_1, 30);
    result.expectOk().expectBool(true);

    call = await stickyToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920050);

    call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10050);
  }
});

Clarinet.test({
  name: "sticky-token: can transfer token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyToken = new StickyToken(chain, deployer);

    let result = await stickyToken.mintForSticky(deployer, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    result = await stickyToken.transfer(wallet_1, 20, wallet_2.address);
    result.expectOk().expectBool(true);

    let call = await stickyToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920100);

    call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10080);

    call = await stickyToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10020);
  }
});

//-------------------------------------
// Tax 
//-------------------------------------

Clarinet.test({
  name: "sticky-token: buy tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyToken = new StickyToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stickyToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // AMM has 10k
    let call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // User has 10k
    call = await stickyToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // Buy = transfer from AMM to user
    result = await stickyToken.transfer(wallet_1, 100, wallet_2.address);
    result.expectOk().expectBool(true);

    // AMM has send 100
    call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(9900);

    // User has got 96 (100 - 3% tax)
    call = await stickyToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10097);

    // Got 3 in taxes
    call = await stickyToken.getTaxBalance();
    call.result.expectUintWithDecimals(3);
  }
});

Clarinet.test({
  name: "sticky-token: sell tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyToken = new StickyToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stickyToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // AMM has 10k
    let call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // User has 10k
    call = await stickyToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // Sell = transfer from user to AMM
    result = await stickyToken.transfer(wallet_2, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    // User has send 100
    call = await stickyToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(9900);
    
    // AMM has got 100 minus 4% tax
    call = await stickyToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10096);

    // Got 4 in taxes
    call = await stickyToken.getTaxBalance();
    call.result.expectUintWithDecimals(4);
  }
});

Clarinet.test({
  name: "sticky-token: withdraw tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyToken = new StickyToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stickyToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // Sell = transfer from user to AMM
    result = await stickyToken.transfer(wallet_2, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    // Got 4 in taxes
    let call = await stickyToken.getTaxBalance();
    call.result.expectUintWithDecimals(4);

    call = await stickyToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000);

    // Withdraw
    result = await stickyToken.withdrawTax(deployer, deployer.address);
    result.expectOk().expectUintWithDecimals(4);

    call = await stickyToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000 + 4);
  }
});

//-------------------------------------
// Admin 
//-------------------------------------

Clarinet.test({
  name: "sticky-token: can set token URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyToken = new StickyToken(chain, deployer);

    let call = await stickyToken.getTokenUri();
    call.result.expectOk().expectSome().expectUtf8("");

    let result = await stickyToken.setTokenUri(deployer, "test-uri");
    result.expectOk().expectBool(true)

    call = await stickyToken.getTokenUri();
    call.result.expectOk().expectSome().expectUtf8("test-uri");
  }
});

Clarinet.test({
  name: "sticky-token: can set buy and sell tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stickyToken = new StickyToken(chain, deployer);

    let call = await stickyToken.getSellTax();
    call.result.expectOk().expectUint(0.04 * 10000);

    call = await stickyToken.getBuyTax();
    call.result.expectOk().expectUint(0.03 * 10000);

    let result = await stickyToken.setTax(deployer, 0.1, 0.2);
    result.expectOk().expectBool(true);

    call = await stickyToken.getBuyTax();
    call.result.expectOk().expectUint(0.1 * 10000);

    call = await stickyToken.getSellTax();
    call.result.expectOk().expectUint(0.2 * 10000);
  }
});

//-------------------------------------
// Error 
//-------------------------------------

Clarinet.test({
  name: "sticky-token: can not transfer is sender is not tx-sender, or sender has not enough",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stickyToken = new StickyToken(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall("sticky-token", "transfer", [
        types.uint(100 * 1000000),
        types.principal(wallet_1.address),
        types.principal(wallet_2.address),
        types.none()
      ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(1401);

    let result = await stickyToken.transfer(wallet_1, 20, wallet_1.address);
    result.expectErr().expectUint(2);
  }
});

Clarinet.test({
  name: "sticky-token: can only withdraw tax to protocol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyToken = new StickyToken(chain, deployer);

    // Withdraw
    let result = await stickyToken.withdrawTax(deployer, wallet_1.address);
    result.expectErr().expectUint(20003);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "sticky-token: only protocol can set token URI, mint and burn for protocol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyToken = new StickyToken(chain, deployer);

    let result = await stickyToken.setTokenUri(wallet_1, "test-uri");
    result.expectErr().expectUint(20003);

    result = await stickyToken.mintForSticky(wallet_1, 100, wallet_1.address);
    result.expectErr().expectUint(20003);

    result = await stickyToken.burnForSticky(wallet_1, 100, deployer.address);
    result.expectErr().expectUint(20003);
  }
});

Clarinet.test({
  name: "sticky-token: only protocol can update tax related vars",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stickyToken = new StickyToken(chain, deployer);

    let result = await stickyToken.setTax(wallet_1, 0.5, 0.5);
    result.expectErr().expectUint(20003);

    result = await stickyToken.setAmmAddresses(wallet_1, [wallet_1.address]);
    result.expectErr().expectUint(20003);
  }
});
