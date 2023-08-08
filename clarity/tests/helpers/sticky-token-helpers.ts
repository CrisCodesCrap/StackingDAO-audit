import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './sticky-tests-utils.ts';

// ---------------------------------------------------------
// Sticky token
// ---------------------------------------------------------

class StickyToken {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getTotalSupply() {
    return this.chain.callReadOnlyFn("sticky-token", "get-total-supply", [], this.deployer.address);
  }

  getName() {
    return this.chain.callReadOnlyFn("sticky-token", "get-name", [], this.deployer.address);
  }

  getSymbol() {
    return this.chain.callReadOnlyFn("sticky-token", "get-symbol", [], this.deployer.address);
  }

  getDecimals() {
    return this.chain.callReadOnlyFn("sticky-token", "get-decimals", [], this.deployer.address);
  }

  getBalance(account: string) {
    return this.chain.callReadOnlyFn("sticky-token", "get-balance", [
      types.principal(account)
    ], this.deployer.address);
  }

  getTokenUri() {
    return this.chain.callReadOnlyFn("sticky-token", "get-token-uri", [], this.deployer.address);
  }

  isAmmAddress(address: string) {
    return this.chain.callReadOnlyFn("sticky-token", "is-amm-address", [
      types.principal(address)
    ], this.deployer.address);
  }

  getBuyTax() {
    return this.chain.callReadOnlyFn("sticky-token", "get-buy-tax", [], this.deployer.address);
  }

  getSellTax() {
    return this.chain.callReadOnlyFn("sticky-token", "get-sell-tax", [], this.deployer.address);
  }

  getTaxBalance() {
    return this.chain.callReadOnlyFn("sticky-token", "get-tax-balance", [], this.deployer.address);
  }

  transfer(caller: Account, amount: number, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "transfer", [
        types.uint(amount * 1000000),
        types.principal(caller.address),
        types.principal(receiver),
        types.none()
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setTokenUri(caller: Account, uri: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "set-token-uri", [
        types.utf8(uri),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  mintForSticky(caller: Account, amount: number, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "mint-for-sticky", [
        types.uint(amount * 1000000),
        types.principal(receiver),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  burnForSticky(caller: Account, amount: number, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "burn-for-sticky", [
        types.uint(amount * 1000000),
        types.principal(receiver),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  burn(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "burn", [
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setTax(caller: Account, buyTax: number, sellTax: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "set-tax", [
        types.uint(buyTax * 10000),
        types.uint(sellTax * 10000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setAmmAddresses(caller: Account, addresses: string[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "set-amm-addresses", [
        types.list(addresses.map(address => types.principal(address))),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  withdrawTax(caller: Account, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-token", "withdraw-tax", [
        types.principal(receiver)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyToken };
