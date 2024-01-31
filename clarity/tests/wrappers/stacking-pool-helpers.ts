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

  prepare(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("stacking-pool-v1", "prepare", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StackingPool };
