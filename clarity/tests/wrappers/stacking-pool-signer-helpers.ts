import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { hexDecode } from './tests-utils.ts';

// ---------------------------------------------------------
// Stacking Pool Signer Helpers
// ---------------------------------------------------------

class StackingPoolSigner {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getPoolOwner() {
    return this.chain.callReadOnlyFn("stacking-pool-signer-v1", "get-pool-owner", [], this.deployer.address);
  }

  getPoxRewardAddress() {
    return this.chain.callReadOnlyFn("stacking-pool-signer-v1", "get-pox-reward-address", [], this.deployer.address);
  }

  getPoxSignerKey() {
    return this.chain.callReadOnlyFn("stacking-pool-signer-v1", "get-pox-signer-key", [], this.deployer.address);
  }

  getCycleToIndex(cycle: number) {
    return this.chain.callReadOnlyFn("stacking-pool-signer-v1", "get-cycle-to-index", [
      types.uint(cycle)
    ], this.deployer.address);
  }

  prepare(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "prepare-stacking-dao", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStx(caller: Account, amount: number, untilBurnHeight: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "delegate-stx", [
        types.uint(amount * 1000000),
        types.some(types.uint(untilBurnHeight))
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  revokeDelegateStx(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "revoke-delegate-stx", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  prepareDelegate(caller: Account, delegate: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "prepare-delegate", [
        types.principal(delegate)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  prepareDelegateMany(caller: Account, delegates: string[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "prepare-delegate-many", [
        types.list(delegates.map(delegate => types.principal(delegate)))
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  getStxAccount(account: string) {
    return this.chain.callReadOnlyFn("stacking-pool-signer-v1", "get-stx-account", [
      types.principal(account)
    ], this.deployer.address);
  }

  notExtendedNextCycle(delegate: string) {
    return this.chain.callReadOnlyFn("stacking-pool-signer-v1", "not-extended-next-cycle", [
      types.principal(delegate)
    ], this.deployer.address);
  }

  delegateStackStx(caller: Account, stacker: string, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "delegate-stack-stx", [
        types.principal(stacker),
        types.uint(amount * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStackExtend(caller: Account, stacker: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "delegate-stack-extend", [
        types.principal(stacker),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStackIncrease(caller: Account, stacker: string, increaseBy: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "delegate-stack-increase", [
        types.principal(stacker),
        types.uint(increaseBy * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  stackAggregationCommitIndexed(caller: Account, rewardCycle: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "stack-aggregation-commit-indexed", [
        types.uint(rewardCycle)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  stackAggregationIncrease(caller: Account, rewardCycle: number, rewardCycleIndex: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "stack-aggregation-increase", [
        types.uint(rewardCycle),
        types.uint(rewardCycleIndex),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setPoolOwner(caller: Account, owner: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "set-pool-owner", [
        types.principal(owner),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setPoxSignerKey(caller: Account, hashbytes: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "set-pox-signer-key", [
        hashbytes
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setPoxRewardAddress(caller: Account, version: string, hashbytes: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "set-pox-reward-address", [
        types.tuple({ 'version': version, 'hashbytes': hashbytes}),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setCycleToSignerSignature(caller: Account, cycle: number, hashbytes: Uint8Array) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "set-cycle-to-signer-signature", [
        types.uint(cycle),
        types.buff(hashbytes)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  async addSignatures(chain: Chain, caller: Account) {
    let block = chain.mineBlock([
      Tx.contractCall("stacking-pool-signer-v1", "set-cycle-to-signer-signature", [
        types.uint(1),
        types.buff(hexDecode("8e20aadcf90b313731a80ff87363903a97ad75dd553fb90de90a21c44d30bb2c1bf9404441ee900519af0ee50015b398658fd6603dcf8259b0cfacf5377de45b01"))
      ], caller.address),
      Tx.contractCall("stacking-pool-signer-v1", "set-cycle-to-signer-signature", [
        types.uint(2),
        types.buff(hexDecode("525f390f19776abfa13daef8551e8d98061245dc87edbdb6a0fee5cc114cc6ba305638082b31bd9ac83e3fe1447bb2756853a35ac0f9c8571ae6503e6a01689f01"))
      ], caller.address),
      Tx.contractCall("stacking-pool-signer-v1", "set-cycle-to-signer-signature", [
        types.uint(3),
        types.buff(hexDecode("4e426571481ca1f85c115a50e107cf386e97a305446211f254e7a514bb20614638eaea335df75449eb1d5a74fa5eb9df6965d9c36ad8d7da797789ce7e7b03f501"))
      ], caller.address),
      Tx.contractCall("stacking-pool-signer-v1", "set-cycle-to-signer-signature", [
        types.uint(4),
        types.buff(hexDecode("d72bac3c4028b9385e53b8f866d9047f184e2508a03784e56b213b7b7f7598dc2b67e0a44fee4911cc7a57f8072d07254ee7bf9bbf87ed0c0d45c4f36307f51f00"))
      ], caller.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    block.receipts[3].result.expectOk().expectBool(true);
  }
  
}
export { StackingPoolSigner };
