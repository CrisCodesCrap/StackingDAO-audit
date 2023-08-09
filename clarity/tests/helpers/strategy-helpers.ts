import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { hexToBytes, qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Strategy V0
// ---------------------------------------------------------


class StrategyV0 {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getLastCyclePerformed() {
    return this.chain.callReadOnlyFn("strategy-v0", "get-last-cycle-performed", [
    ], this.deployer.address);
  }

  getPoxRewardAddress() {
    return this.chain.callReadOnlyFn("strategy-v0", "get-pox-reward-address", [
    ], this.deployer.address);
  }

  getPoxCycle() {
    return this.chain.callReadOnlyFn("strategy-v0", "get-pox-cycle", [
    ], this.deployer.address);
  }

  getNextCycleStartBurnHeight() {
    return this.chain.callReadOnlyFn("strategy-v0", "get-next-cycle-start-burn-height", [
    ], this.deployer.address);
  }

  getTotalStacking() {
    return this.chain.callReadOnlyFn("strategy-v0", "get-total-stacking", [
    ], this.deployer.address);
  }

  getInflowOutflow() {
    return this.chain.callReadOnlyFn("strategy-v0", "get-outflow-inflow", [
    ], this.deployer.address);
  }

  stackersGetTotalStacking(stackerId: number) {
    return this.chain.callReadOnlyFn("strategy-v0", "stackers-get-total-stacking", [
      types.uint(stackerId)
    ], this.deployer.address);
  }

  setPoxRewardAddress(caller: Account, version: Uint8Array, hashbytes: Uint8Array) {
    let block = this.chain.mineBlock([
      Tx.contractCall("strategy-v0", "set-pox-reward-address", [
        types.tuple({
          version: types.buff(version),
          hashbytes: types.buff(hashbytes)
        }),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  performInflow(caller: Account, stackingAmounts: number[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("strategy-v0", "perform-inflow", [
        types.list(stackingAmounts.map(amount => types.uint(amount * 1000000)))
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  performOutflow(caller: Account, stackersToStop: boolean[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("strategy-v0", "perform-outflow", [
        types.list(stackersToStop.map(stop => types.bool(stop)))
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  stackersReturnStx(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("strategy-v0", "stackers-return-stx", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StrategyV0 };

// ---------------------------------------------------------
// Strategy V1
// ---------------------------------------------------------

class StrategyV1 {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getLastCyclePrepared() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-last-cycle-prepared", [
    ], this.deployer.address);
  }

  canPrepareNextCycle() {
    return this.chain.callReadOnlyFn("strategy-v1", "can-prepare-next-cycle", [
    ], this.deployer.address);
  }

  getStackerInfo(id: number) {
    return this.chain.callReadOnlyFn("strategy-v1", "get-stacker-info", [
      types.uint(id)
    ], this.deployer.address);
  }

  getTotalStackedNew() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-total-stacked-new", [
    ], this.deployer.address);
  }

  getInflowToAssign() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-inflow-to-assign", [
    ], this.deployer.address);
  }

  getStackerInflow(id: number) {
    return this.chain.callReadOnlyFn("strategy-v1", "get-stacker-inflow", [
      types.uint(id)
    ], this.deployer.address);
  }

  getTotalOutflow() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-total-outflow", [
    ], this.deployer.address);
  }

  getMinimumLeftover() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-minimum-leftover", [
    ], this.deployer.address);
  }

  getStackersToStop() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-stackers-to-stop", [
    ], this.deployer.address);
  }

  getStackingMinimum() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-stacking-minimum", [
    ], this.deployer.address);
  }

  getPrepareCycleLength() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-prepare-cycle-length", [
    ], this.deployer.address);
  }

  getPoxCycle() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-pox-cycle", [
    ], this.deployer.address);
  }

  getNextCycleStartBurnHeight() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-next-cycle-start-burn-height", [
    ], this.deployer.address);
  }

  getTotalStacking() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-total-stacking", [
    ], this.deployer.address);
  }

  getOutflowInflow() {
    return this.chain.callReadOnlyFn("strategy-v1", "get-outflow-inflow", [
    ], this.deployer.address);
  }

  performStacking(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("strategy-v1", "perform-stacking", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  calculateStackingOutflow(caller: Account, outflow: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("strategy-v1", "calculate-stacking-outflow", [
        types.uint(outflow * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  calculateStackingInflow(caller: Account, inflow: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("strategy-v1", "calculate-stacking-inflow", [
        types.uint(inflow * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StrategyV1 };
