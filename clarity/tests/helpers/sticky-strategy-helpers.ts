import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './sticky-tests-utils.ts';

// ---------------------------------------------------------
// Sticky Strategy
// ---------------------------------------------------------

class StickyStrategy {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getLastCyclePrepared() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-last-cycle-prepared", [
    ], this.deployer.address);
  }

  canPrepareNextCycle() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "can-prepare-next-cycle", [
    ], this.deployer.address);
  }

  getStackerInfo(id: number) {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-stacker-info", [
      types.uint(id)
    ], this.deployer.address);
  }

  getTotalStackedNew() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-total-stacked-new", [
    ], this.deployer.address);
  }

  getInflowToAssign() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-inflow-to-assign", [
    ], this.deployer.address);
  }

  getStackerInflow(id: number) {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-stacker-inflow", [
      types.uint(id)
    ], this.deployer.address);
  }

  getTotalOutflow() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-total-outflow", [
    ], this.deployer.address);
  }

  getMinimumLeftover() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-minimum-leftover", [
    ], this.deployer.address);
  }

  getStackersToStop() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-stackers-to-stop", [
    ], this.deployer.address);
  }

  getStackingMinimum() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-stacking-minimum", [
    ], this.deployer.address);
  }

  getPrepareCycleLength() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-prepare-cycle-length", [
    ], this.deployer.address);
  }

  getPoxCycle() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-pox-cycle", [
    ], this.deployer.address);
  }

  getNextCycleStartBurnHeight() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-next-cycle-start-burn-height", [
    ], this.deployer.address);
  }

  getTotalStacking() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-total-stacking", [
    ], this.deployer.address);
  }

  getOutflowInflow() {
    return this.chain.callReadOnlyFn("sticky-strategy-v1", "get-outflow-inflow", [
    ], this.deployer.address);
  }

  performStacking(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-strategy-v1", "perform-stacking", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  calculateStackingOutflow(caller: Account, outflow: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-strategy-v1", "calculate-stacking-outflow", [
        types.uint(outflow * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  calculateStackingInflow(caller: Account, inflow: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-strategy-v1", "calculate-stacking-inflow", [
        types.uint(inflow * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyStrategy };
