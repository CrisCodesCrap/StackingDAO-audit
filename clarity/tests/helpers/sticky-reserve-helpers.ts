import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './sticky-tests-utils.ts';

// ---------------------------------------------------------
// Sticky Reserve
// ---------------------------------------------------------

class StickyReserve {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getStxInUse() {
    return this.chain.callReadOnlyFn("sticky-reserve-v1", "get-stx-in-use", [], this.deployer.address);
  }

  getStxIdle() {
    return this.chain.callReadOnlyFn("sticky-reserve-v1", "get-stx-idle", [], this.deployer.address);
  }

  getTotalStx() {
    return this.chain.callReadOnlyFn("sticky-reserve-v1", "get-total-stx", [], this.deployer.address);
  }

  getShutdownEnabled() {
    return this.chain.callReadOnlyFn("sticky-reserve-v1", "get-shutdown-enabled", [], this.deployer.address);
  }

  requestStx(caller: Account, amount: number, receiver: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-reserve-v1", "request-stx", [
        types.uint(amount * 1000000),
        types.principal(receiver)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  requestStxToStack(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-reserve-v1", "request-stx-to-stack", [
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  returnStxFromStacking(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-reserve-v1", "return-stx-from-stacking", [
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyReserve };
