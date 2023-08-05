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
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-shutdown-activated", [], this.deployer.address);
  }

  getGuardianAddress() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-guardian-address", [], this.deployer.address);
  }

  getDepositsByCycle(cycle: number) {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-deposits-by-cycle", [
      types.uint(cycle),
    ], this.deployer.address);
  }

  getWithdrawalsByCycle(cycle: number) {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-withdrawals-by-cycle", [
      types.uint(cycle),
    ], this.deployer.address);
  }

  getWithdrawalsByAddress(address: string) {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-withdrawals-by-address", [
      types.principal(address),
    ], this.deployer.address);
  }

  getStxBalance(address: string) {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-stx-balance", [
      types.principal(address),
    ], this.deployer.address);
  }

  getBurnHeight() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-burn-height", [], this.deployer.address);
  }

  getPoxCycle() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-pox-cycle", [], this.deployer.address);
  }

  getStxPerStstx() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-stx-per-ststx", [
      types.principal(qualifiedName("sticky-reserve-v1"))
    ], this.deployer.address);
  }

  setWithdrawalTreshold(caller: Account, treshold: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "set-withdrawal-treshold", [
        types.uint(treshold * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setCommission(caller: Account, commission: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "set-commission", [
        types.uint(commission * 10000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setGuardianAddress(caller: Account, address: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "set-guardian-address", [
        types.principal(address),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  toggleShutdown(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "toggle-shutdown", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  deposit(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "deposit", [
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  initWithdraw(caller: Account, amount: number, cycle: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "init-withdraw", [
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.uint(amount * 1000000),
        types.uint(cycle),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  withdraw(caller: Account, cycle: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "withdraw", [
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.uint(cycle)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  addRewards(caller: Account, amount: number, cycle: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "add-rewards", [
        types.principal(qualifiedName("sticky-commission-v1")),
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.uint(amount * 1000000),
        types.uint(cycle)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyCore };
