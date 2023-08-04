import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './sticky-tests-utils.ts';

// ---------------------------------------------------------
// Sticky Core
// ---------------------------------------------------------

class StickyCore {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getShutdownActivated() {
    return this.chain.callReadOnlyFn("sticky-core", "get-shutdown-activated", [], this.deployer.address);
  }

  getGuardianAddress() {
    return this.chain.callReadOnlyFn("sticky-core", "get-guardian-address", [], this.deployer.address);
  }

  getDepositsByCycle(cycle: number) {
    return this.chain.callReadOnlyFn("sticky-core", "get-deposits-by-cycle", [
      types.uint(cycle),
    ], this.deployer.address);
  }

  getWithdrawalsByCycle(cycle: number) {
    return this.chain.callReadOnlyFn("sticky-core", "get-withdrawals-by-cycle", [
      types.uint(cycle),
    ], this.deployer.address);
  }

  getWithdrawalsByAddress(address: string) {
    return this.chain.callReadOnlyFn("sticky-core", "get-withdrawals-by-address", [
      types.principal(address),
    ], this.deployer.address);
  }

  getStxBalance(address: string) {
    return this.chain.callReadOnlyFn("sticky-core", "get-stx-balance", [
      types.principal(address),
    ], this.deployer.address);
  }

  getBurnHeight() {
    return this.chain.callReadOnlyFn("sticky-core", "get-burn-height", [], this.deployer.address);
  }

  getPoxCycle() {
    return this.chain.callReadOnlyFn("sticky-core", "get-pox-cycle", [], this.deployer.address);
  }

  getStxPerStstx() {
    return this.chain.callReadOnlyFn("sticky-core", "get-stx-per-ststx", [], this.deployer.address);
  }

  setWithdrawalTreshold(caller: Account, treshold: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core", "set-withdrawal-treshold", [
        types.uint(treshold * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setGuardianAddress(caller: Account, address: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core", "set-guardian-address", [
        types.principal(address),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  toggleShutdown(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core", "toggle-shutdown", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  deposit(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core", "deposit", [
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  initWithdraw(caller: Account, amount: number, cycle: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core", "init-withdraw", [
        types.uint(amount * 1000000),
        types.uint(cycle),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  withdraw(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core", "withdraw", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  addRewards(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core", "add-rewards", [
        types.uint(amount * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyCore };
