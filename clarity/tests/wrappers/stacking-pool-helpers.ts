import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Stacking Pool Helpers
// ---------------------------------------------------------

class StackingPool {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getPoxRewardAddress() {
    return this.chain.callReadOnlyFn("stacking-pool-v1", "get-pox-reward-address", [], this.deployer.address);
  }

  getCycleToIndex(cycle: number) {
    return this.chain.callReadOnlyFn("stacking-pool-v1", "get-cycle-to-index", [
      types.uint(cycle)
    ], this.deployer.address);
  }

  getPoxInfo() {
    return this.chain.callReadOnlyFn("stacking-pool-v1", "get-pox-info", [], this.deployer.address);
  }

  totalDelegated() {
    return this.chain.callReadOnlyFn("stacking-pool-v1", "total-delegated", [], this.deployer.address);
  }

  totalDelegatedHelper(delegate: string) {
    return this.chain.callReadOnlyFn("stacking-pool-v1", "total-delegated-helper", [
      types.principal(delegate)
    ], this.deployer.address);
  }

  prepare(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "prepare-stacking-dao", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStx(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "delegate-stx", [
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  revokeDelegateStx(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "revoke-delegate-stx", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  prepareDelegate(caller: Account, delegate: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "prepare-delegate", [
        types.principal(delegate)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  prepareDelegateMany(caller: Account, delegates: string[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "prepare-delegate-many", [
        types.list(delegates.map(delegate => types.principal(delegate)))
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  getStxAccount(account: string) {
    return this.chain.callReadOnlyFn("stacking-pool-v1", "get-stx-account", [
      types.principal(account)
    ], this.deployer.address);
  }

  notExtendedNextCycle(delegate: string) {
    return this.chain.callReadOnlyFn("stacking-pool-v1", "not-extended-next-cycle", [
      types.principal(delegate)
    ], this.deployer.address);
  }

  delegateStackStx(caller: Account, stacker: string, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "delegate-stack-stx", [
        types.principal(stacker),
        types.uint(amount * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStackExtend(caller: Account, stacker: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "delegate-stack-extend", [
        types.principal(stacker),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStackIncrease(caller: Account, stacker: string, increaseBy: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "delegate-stack-increase", [
        types.principal(stacker),
        types.uint(increaseBy * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  stackAggregationCommitIndexed(caller: Account, rewardCycle: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "stack-aggregation-commit-indexed", [
        types.uint(rewardCycle)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  stackAggregationIncrease(caller: Account, rewardCycle: number, rewardCycleIndex: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "stack-aggregation-increase", [
        types.uint(rewardCycle),
        types.uint(rewardCycleIndex),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setPoxRewardAddress(caller: Account, version: string, hashbytes: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "set-pox-reward-address", [
        types.tuple({ 'version': version, 'hashbytes': hashbytes}),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }
}
export { StackingPool };
