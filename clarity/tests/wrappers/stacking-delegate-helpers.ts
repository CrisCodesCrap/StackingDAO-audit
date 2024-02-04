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

  delegateStx(caller: Account, amount: number, delegateTo: string, untilBurnHeight: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "delegate-stx", [
        types.uint(amount * 1000000),
        types.principal(delegateTo),
        types.some(types.uint(untilBurnHeight))
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  revokeDelegateStx(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "revoke-delegate-stx", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  requestStxToStack(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "request-stx-to-stack", [
        types.principal(qualifiedName("reserve-v1")),
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  returnStxFromStacking(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "return-stx-from-stacking", [
        types.principal(qualifiedName("reserve-v1")),
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  returnStx(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-delegate-1-1", "return-stx", [
        types.principal(qualifiedName("reserve-v1")),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }


}
export { StackingDelegate };
