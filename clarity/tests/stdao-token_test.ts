import { Account, Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet/index.ts";
import { qualifiedName } from "./helpers/tests-utils.ts";
qualifiedName("")

import { STDAOToken } from './helpers/stdao-token-helpers.ts';

//-------------------------------------
// Getters 
//-------------------------------------

Clarinet.test({
  name: "stdao-token: can get token info",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_4 = accounts.get("wallet_4")!

    let stDaoToken = new STDAOToken(chain, deployer);

    let call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920000);

    call = await stDaoToken.getName();
    call.result.expectOk().expectAscii("StackingDAO Token");

    call = await stDaoToken.getSymbol();
    call.result.expectOk().expectAscii("STDAO");

    call = await stDaoToken.getDecimals();
    call.result.expectOk().expectUint(6);

    call = await stDaoToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000);

    call = await stDaoToken.getBalance(wallet_4.address);
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stDaoToken.getTokenUri();
    call.result.expectOk().expectSome().expectUtf8("");
  }
});

//-------------------------------------
// Core 
//-------------------------------------

Clarinet.test({
  name: "stdao-token: can mint/burn as protocol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    let call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920000);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    let result = await stDaoToken.mintForProtocol(deployer, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920100);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10100);

    result = await stDaoToken.burnForProtocol(deployer, 20, wallet_1.address);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920080);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10080);

    result = await stDaoToken.burn(wallet_1, 30);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920050);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10050);
  }
});

Clarinet.test({
  name: "stdao-token: can transfer token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    let result = await stDaoToken.mintForProtocol(deployer, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    result = await stDaoToken.transfer(wallet_1, 20, wallet_2.address);
    result.expectOk().expectBool(true);

    let call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(920100);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10080);

    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10020);
  }
});

//-------------------------------------
// Tax 
//-------------------------------------

Clarinet.test({
  name: "stdao-token: no tax if not to/from amm",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stDaoToken.setAmmAddresses(deployer, [deployer.address]);
    result.expectOk().expectBool(true);

    // AMM has 10k
    let call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // User has 10k
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // Buy = transfer from AMM to user
    result = await stDaoToken.transfer(wallet_1, 100, wallet_2.address);
    result.expectOk().expectBool(true);

    // AMM has send 100
    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(9900);

    // User has got full 100
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10100);

    // No taxes
    call = await stDaoToken.getTaxBalance();
    call.result.expectUintWithDecimals(0);
  }
});

Clarinet.test({
  name: "stdao-token: no tax if address excluded from taxes",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stDaoToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // Exclude address
    result = await stDaoToken.setExcludeFromFees(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // AMM has 10k
    let call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // User has 10k
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // Buy = transfer from AMM to user
    result = await stDaoToken.transfer(wallet_1, 100, wallet_2.address);
    result.expectOk().expectBool(true);

    // AMM has send 100
    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(9900);

    // User has got full 100 tokens
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10100);

    // No taxes
    call = await stDaoToken.getTaxBalance();
    call.result.expectUintWithDecimals(0);
  }
});

Clarinet.test({
  name: "stdao-token: buy tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stDaoToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // AMM has 10k
    let call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // User has 10k
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // Buy = transfer from AMM to user
    result = await stDaoToken.transfer(wallet_1, 100, wallet_2.address);
    result.expectOk().expectBool(true);

    // AMM has send 100
    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(9900);

    // User has got 96 (100 - 3% tax)
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10097);

    // Got 3 in taxes
    call = await stDaoToken.getTaxBalance();
    call.result.expectUintWithDecimals(3);
  }
});

Clarinet.test({
  name: "stdao-token: sell tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stDaoToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // AMM has 10k
    let call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // User has 10k
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(10000);

    // Sell = transfer from user to AMM
    result = await stDaoToken.transfer(wallet_2, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    // User has send 100
    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(9900);
    
    // AMM has got 100 minus 4% tax
    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(10096);

    // Got 4 in taxes
    call = await stDaoToken.getTaxBalance();
    call.result.expectUintWithDecimals(4);
  }
});

Clarinet.test({
  name: "stdao-token: withdraw tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    // Set wallet_1 as AMM
    let result = await stDaoToken.setAmmAddresses(deployer, [wallet_1.address]);
    result.expectOk().expectBool(true);

    // Sell = transfer from user to AMM
    result = await stDaoToken.transfer(wallet_2, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    // Got 4 in taxes
    let call = await stDaoToken.getTaxBalance();
    call.result.expectUintWithDecimals(4);

    call = await stDaoToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000);

    // Withdraw
    result = await stDaoToken.withdrawTax(deployer, deployer.address);
    result.expectOk().expectUintWithDecimals(4);

    call = await stDaoToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(890000 + 4);
  }
});

//-------------------------------------
// Admin 
//-------------------------------------

Clarinet.test({
  name: "stdao-token: can set token URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    let call = await stDaoToken.getTokenUri();
    call.result.expectOk().expectSome().expectUtf8("");

    let result = await stDaoToken.setTokenUri(deployer, "test-uri");
    result.expectOk().expectBool(true)

    call = await stDaoToken.getTokenUri();
    call.result.expectOk().expectSome().expectUtf8("test-uri");
  }
});

Clarinet.test({
  name: "stdao-token: can set buy and sell tax",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    let call = await stDaoToken.getSellTax();
    call.result.expectOk().expectUint(0.04 * 10000);

    call = await stDaoToken.getBuyTax();
    call.result.expectOk().expectUint(0.03 * 10000);

    let result = await stDaoToken.setTax(deployer, 0.1, 0.2);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getBuyTax();
    call.result.expectOk().expectUint(0.1 * 10000);

    call = await stDaoToken.getSellTax();
    call.result.expectOk().expectUint(0.2 * 10000);
  }
});

//-------------------------------------
// Error 
//-------------------------------------

Clarinet.test({
  name: "stdao-token: can not transfer is sender is not tx-sender, or sender has not enough",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall("stdao-token", "transfer", [
        types.uint(100 * 1000000),
        types.principal(wallet_1.address),
        types.principal(wallet_2.address),
        types.none()
      ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(1401);

    let result = await stDaoToken.transfer(wallet_1, 20, wallet_1.address);
    result.expectErr().expectUint(2);
  }
});

Clarinet.test({
  name: "stdao-token: can only withdraw tax to protocol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    // Withdraw
    let result = await stDaoToken.withdrawTax(wallet_1, wallet_1.address);
    result.expectErr().expectUint(20003);
  }
});

//-------------------------------------
// Access 
//-------------------------------------

Clarinet.test({
  name: "stdao-token: only protocol can set token URI, mint and burn for protocol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    let result = await stDaoToken.setTokenUri(wallet_1, "test-uri");
    result.expectErr().expectUint(20003);

    result = await stDaoToken.mintForProtocol(wallet_1, 100, wallet_1.address);
    result.expectErr().expectUint(20003);

    result = await stDaoToken.burnForProtocol(wallet_1, 100, deployer.address);
    result.expectErr().expectUint(20003);
  }
});

Clarinet.test({
  name: "stdao-token: only protocol can update tax related vars",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let stDaoToken = new STDAOToken(chain, deployer);

    let result = await stDaoToken.setTax(wallet_1, 0.5, 0.5);
    result.expectErr().expectUint(20003);

    result = await stDaoToken.setAmmAddresses(wallet_1, [wallet_1.address]);
    result.expectErr().expectUint(20003);
  }
});
