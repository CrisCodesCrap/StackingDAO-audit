import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Fast Pool V2
// ---------------------------------------------------------

class FastPoolV2 {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  delegateStx(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("pox-fast-pool-v2-mock", "delegate-stx", [
        types.uint(amount * 1000000),
      ], caller.address)
    ]);
    console.log("events:", block.receipts[0].events)
    return block.receipts[0].result;
  }

  delegateStackStx(caller: Account, user: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("pox-fast-pool-v2-mock", "delegate-stack-stx", [
        types.principal(user),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  delegateStackStxMany(caller: Account, users: string[]) {
    let block = this.chain.mineBlock([
      Tx.contractCall("pox-fast-pool-v2-mock", "delegate-stack-stx-many", [
        types.list(users.map(user => types.principal(user))),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { FastPoolV2 };
