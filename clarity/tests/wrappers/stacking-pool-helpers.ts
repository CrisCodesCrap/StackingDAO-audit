import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { hexDecode } from './tests-utils.ts';

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

  prepare(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "prepare-stacking-dao", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStx(caller: Account, amount: number, untilBurnHeight: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "delegate-stx", [
        types.uint(amount * 1000000),
        types.some(types.uint(untilBurnHeight))
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

  async addSignatures(chain: Chain, caller: Account) {
    let block = chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "set-cycle-to-signer-signature", [
        types.uint(1),
        types.buff(hexDecode("8e9e8397a0f47dc2b4f26b840dc724b19949af05f41dbfcf0af02bb2614a97ad0b6488a4deeb70b62834c7fe443e44c9d986dee8f19ceb7f93673d00f29a56a200"))
      ], caller.address),
      Tx.contractCall("stacking-pool-v1", "set-cycle-to-signer-signature", [
        types.uint(2),
        types.buff(hexDecode("5fc920a9354ab2672b8f5960e5c21ae45da2e55a0743a986dc0b6a9d3fb4f6482075f9564f92a0217adc605ca250080d1e4c36b194b02b02e0af4fbd4166fbf700"))
      ], caller.address),
      Tx.contractCall("stacking-pool-v1", "set-cycle-to-signer-signature", [
        types.uint(3),
        types.buff(hexDecode("cd89a18177612ffd2b8603c9decc2ceb72e2780ef094b30b0705a632108f05fe7576807e1fb506246e3b94af8e545cd459b57013be070bc287e04ef357c4cf7901"))
      ], caller.address),
      Tx.contractCall("stacking-pool-v1", "set-cycle-to-signer-signature", [
        types.uint(4),
        types.buff(hexDecode("f3c8435ac4747b2a3977437e8a886906aea4b95dce9000592774a2ee79ea85742b66a64eaa536e7621ac3808d3a3fece845fe43d1c8b4ea28330900a6288873600"))
      ], caller.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    block.receipts[3].result.expectOk().expectBool(true);
  }
  
}
export { StackingPool };
