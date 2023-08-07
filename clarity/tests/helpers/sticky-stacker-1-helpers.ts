import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './sticky-tests-utils.ts';

// ---------------------------------------------------------
// Sticky Stacker 1
// ---------------------------------------------------------

class StickyStacker1 {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getStackingUnlockBurnHeight() {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "get-stacking-unlock-burn-height", [], this.deployer.address);
  }

  getStackingStxStacked() {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "get-stacking-stx-stacked", [], this.deployer.address);
  }

  getStxBalance() {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "get-stx-balance", [], this.deployer.address);
  }

  getStxStacked() {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "get-stx-stacked", [], this.deployer.address);
  }

  getStackerInfo() {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "get-stacker-info", [], this.deployer.address);
  }

  getStxAccount() {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "get-stx-account", [], this.deployer.address);
  }

  getPoxInfo() {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "get-pox-info", [], this.deployer.address);
  }

  poxCanStackStx(caller: Account, amount: number, startBurnHeight: number, lockPeriod: number) {
    return this.chain.callReadOnlyFn("sticky-stacker-1", "pox-can-stack-stx", [
      types.tuple({ 'version': '0x00', 'hashbytes': '0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac'}),
      types.uint(amount * 1000000),
      types.uint(startBurnHeight), 
      types.uint(lockPeriod) 
    ], caller.address);
  }

  initiateStacking(caller: Account, amount: number, startBurnHeight: number, lockPeriod: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-stacker-1", "initiate-stacking", [
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.tuple({ 'version': '0x00', 'hashbytes': '0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac'}),
        types.uint(amount * 1000000),
        types.uint(startBurnHeight), 
        types.uint(lockPeriod) 
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  stackIncrease(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-stacker-1", "stack-increase", [
        types.principal(qualifiedName("sticky-reserve-v1")),
        types.uint(amount * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  stackExtend(caller: Account, extendCount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-stacker-1", "stack-extend", [
        types.uint(extendCount),
        types.tuple({ 'version': '0x00', 'hashbytes': '0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac'}),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  returnStx(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-stacker-1", "return-stx", [
        types.principal(qualifiedName("sticky-reserve-v1")),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }
}
export { StickyStacker1 };
