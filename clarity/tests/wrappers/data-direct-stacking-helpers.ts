import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Data Direct Stacking
// ---------------------------------------------------------

class DataDirectStacking {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getDirectStackingDependence() {
    return this.chain.callReadOnlyFn("data-direct-stacking-v1", "get-direct-stacking-dependence", [], this.deployer.address);
  }

  getTotalDirectStacking() {
    return this.chain.callReadOnlyFn("data-direct-stacking-v1", "get-total-directed-stacking", [], this.deployer.address);
  }

  getDirectStackingPoolAmount(pool: string) {
    return this.chain.callReadOnlyFn("data-direct-stacking-v1", "get-direct-stacking-pool-amount", [
      types.principal(pool)
    ], this.deployer.address);
  }

  getDirectStackingUser(user: string) {
    return this.chain.callReadOnlyFn("data-direct-stacking-v1", "get-direct-stacking-user", [
      types.principal(user)
    ], this.deployer.address);
  }

  setDirectStackingDependence(caller: Account, dependence: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("data-direct-stacking-v1", "set-direct-stacking-dependence", [
        types.uint(dependence ),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  getSupportedProtocols() {
    return this.chain.callReadOnlyFn("data-direct-stacking-v1", "get-supported-protocols", [
    ], this.deployer.address);
  }

}
export { DataDirectStacking };
