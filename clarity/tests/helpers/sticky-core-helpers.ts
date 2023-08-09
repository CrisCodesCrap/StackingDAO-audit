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

  getWithdrawalTresholdPerCycle() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-withdrawal-treshold-per-cycle", [], this.deployer.address);
  }

  getCommission() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-commission", [], this.deployer.address);
  }

  getShutdownDeposits() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-shutdown-deposits", [], this.deployer.address);
  }

  getShutdownWithdrawals() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-shutdown-withdrawals", [], this.deployer.address);
  }

  getCycleInfo(cycle: number) {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-cycle-info", [
      types.uint(cycle)
    ], this.deployer.address);
  }

  getWithdrawalsByAddress(address: string) {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-withdrawals-by-address", [
      types.principal(address),
    ], this.deployer.address);
  }

  getBurnHeight() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-burn-height", [], this.deployer.address);
  }

  getPoxCycle() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-pox-cycle", [], this.deployer.address);
  }

  getStxBalance(address: string) {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-stx-balance", [
      types.principal(address),
    ], this.deployer.address);
  }

  getNextWithdrawCycle() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-next-withdraw-cycle", [
    ], this.deployer.address);
  }

  getStxPerStstx() {
    return this.chain.callReadOnlyFn("sticky-core-v1", "get-stx-per-ststx", [
      types.principal(qualifiedName("sticky-reserve-v1"))
    ], this.deployer.address);
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

  initWithdraw(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "init-withdraw", [
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.uint(amount * 1000000)
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
        types.principal(qualifiedName("sticky-staking-v1")),
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.uint(amount * 1000000),
        types.uint(cycle)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setWithdrawalTreshold(caller: Account, treshold: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "set-withdrawal-treshold", [
        types.uint(treshold * 10000),
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

  setShutdownDeposits(caller: Account, shutdown: boolean) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "set-shutdown-deposits", [
        types.bool(shutdown),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setShutdownWithdrawals(caller: Account, shutdown: boolean) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-core-v1", "set-shutdown-withdrawals", [
        types.bool(shutdown),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyCore };
