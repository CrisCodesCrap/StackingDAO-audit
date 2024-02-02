import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Stacking Delegate Helpers
// ---------------------------------------------------------

class StackingDelegate {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getLastSelectedPool() {
    return this.chain.callReadOnlyFn("stacking-delegate-1-1", "get-last-selected-pool", [], this.deployer.address);
  }

  getTargetLockedAmount() {
    return this.chain.callReadOnlyFn("stacking-delegate-1-1", "get-target-locked-amount", [], this.deployer.address);
  }

  getLastLockedAmount() {
    return this.chain.callReadOnlyFn("stacking-delegate-1-1", "get-last-locked-amount", [], this.deployer.address);
  }

  getLastContractAmount() {
    return this.chain.callReadOnlyFn("stacking-delegate-1-1", "get-last-contract-amount", [], this.deployer.address);
  }

  getStxAccount(user: string) {
    return this.chain.callReadOnlyFn("stacking-delegate-1-1", "get-stx-account", [
      types.principal(user)
    ], this.deployer.address);
  }

  calculateRewards() {
    return this.chain.callReadOnlyFn("stacking-delegate-1-1", "calculate-rewards", [
    ], this.deployer.address);
  }


  calculateExcess() {
    return this.chain.callReadOnlyFn("stacking-delegate-1-1", "calculate-excess", [
    ], this.deployer.address);
  }

  handleRewards(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "handle-rewards", [
        types.principal(qualifiedName("reserve-v1")),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  handleExcess(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "handle-excess", [
        types.principal(qualifiedName("reserve-v1")),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  revoke(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "revoke", [
        types.principal(qualifiedName("reserve-v1")),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  revokeAndDelegate(caller: Account, amount: number, delegateTo: string, untilBurnHeight: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "revoke-and-delegate", [
        types.principal(qualifiedName("reserve-v1")),
        types.uint(amount * 1000000),
        types.principal(delegateTo),
        types.uint(untilBurnHeight),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }



}
export { StackingDelegate };
