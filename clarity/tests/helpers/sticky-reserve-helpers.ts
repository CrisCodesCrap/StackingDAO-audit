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

  getTotalStx() {
    return this.chain.callReadOnlyFn("sticky-reserve-v1", "get-total-stx", [], this.deployer.address);
  }

}
export { StickyReserve };
