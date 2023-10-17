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

    let result = stDaoToken.mintForProtocol(deployer, 100, deployer.address);
    result.expectOk().expectBool(true);

    let call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(100);

    call = await stDaoToken.getName();
    call.result.expectOk().expectAscii("StackingDAO Token");

    call = await stDaoToken.getSymbol();
    call.result.expectOk().expectAscii("STDAO");

    call = await stDaoToken.getDecimals();
    call.result.expectOk().expectUint(6);

    call = await stDaoToken.getBalance(deployer.address);
    call.result.expectOk().expectUintWithDecimals(100);

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
    call.result.expectOk().expectUintWithDecimals(0);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(0);

    let result = await stDaoToken.mintForProtocol(deployer, 100, wallet_1.address);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(100);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(100);

    result = await stDaoToken.burnForProtocol(deployer, 20, wallet_1.address);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(80);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(80);

    result = await stDaoToken.burn(wallet_1, 30);
    result.expectOk().expectBool(true);

    call = await stDaoToken.getTotalSupply();
    call.result.expectOk().expectUintWithDecimals(50);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(50);
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
    call.result.expectOk().expectUintWithDecimals(100);

    call = await stDaoToken.getBalance(wallet_1.address);
    call.result.expectOk().expectUintWithDecimals(80);

    call = await stDaoToken.getBalance(wallet_2.address);
    call.result.expectOk().expectUintWithDecimals(20);
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
