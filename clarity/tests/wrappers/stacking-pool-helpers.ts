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
      Tx.contractCall("stacking-pool-v1", "prepare", [
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

}
export { StackingPool };
