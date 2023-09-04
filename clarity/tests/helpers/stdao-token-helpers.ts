import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// STDAO token
// ---------------------------------------------------------

class STDAOToken {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getTotalSupply() {
    return this.chain.callReadOnlyFn("stdao-token", "get-total-supply", [], this.deployer.address);
  }

  getName() {
    return this.chain.callReadOnlyFn("stdao-token", "get-name", [], this.deployer.address);
  }

  getSymbol() {
    return this.chain.callReadOnlyFn("stdao-token", "get-symbol", [], this.deployer.address);
  }

  getDecimals() {
    return this.chain.callReadOnlyFn("stdao-token", "get-decimals", [], this.deployer.address);
  }

  getBalance(account: string) {
    return this.chain.callReadOnlyFn("stdao-token", "get-balance", [
      types.principal(account)
    ], this.deployer.address);
  }

  getTokenUri() {
    return this.chain.callReadOnlyFn("stdao-token", "get-token-uri", [], this.deployer.address);
  }

  isAmmAddress(address: string) {
    return this.chain.callReadOnlyFn("stdao-token", "is-amm-address", [
      types.principal(address)
    ], this.deployer.address);
  }

  isExcludedFromFees(address: string) {
    return this.chain.callReadOnlyFn("stdao-token", "is-excluded-from-fees", [
      types.principal(address)
    ], this.deployer.address);
  }

  getBuyTax() {
    return this.chain.callReadOnlyFn("stdao-token", "get-buy-tax", [], this.deployer.address);
  }

  getSellTax() {
    return this.chain.callReadOnlyFn("stdao-token", "get-sell-tax", [], this.deployer.address);
  }

  getTaxBalance() {
    return this.chain.callReadOnlyFn("stdao-token", "get-tax-balance", [], this.deployer.address);
  }

  transfer(caller: Account, amount: number, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "transfer", [
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
      Tx.contractCall("stdao-token", "set-token-uri", [
        types.utf8(uri),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  mintForProtocol(caller: Account, amount: number, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "mint-for-protocol", [
        types.uint(amount * 1000000),
        types.principal(receiver),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  burnForProtocol(caller: Account, amount: number, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "burn-for-protocol", [
        types.uint(amount * 1000000),
        types.principal(receiver),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  burn(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "burn", [
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setTax(caller: Account, buyTax: number, sellTax: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "set-tax", [
        types.uint(buyTax * 10000),
        types.uint(sellTax * 10000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setAmmAddresses(caller: Account, addresses: string[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "set-amm-addresses", [
        types.list(addresses.map(address => types.principal(address))),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setExcludeFromFees(caller: Account, addresses: string[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "set-exclude-from-fees", [
        types.list(addresses.map(address => types.principal(address))),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  withdrawTax(caller: Account, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stdao-token", "withdraw-tax", [
        types.principal(receiver)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { STDAOToken };
