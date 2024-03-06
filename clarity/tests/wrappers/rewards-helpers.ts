import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Rewards
// ---------------------------------------------------------

class Rewards {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getTotalCommission() {
    return this.chain.callReadOnlyFn("rewards-v1", "get-total-commission", [], this.deployer.address);
  }

  getTotalRewardsLeft() {
    return this.chain.callReadOnlyFn("rewards-v1", "get-total-rewards-left", [], this.deployer.address);
  }

  getRewardsUnlock() {
    return this.chain.callReadOnlyFn("rewards-v1", "get-rewards-unlock", [], this.deployer.address);
  }

  nextRewardsUnlock() {
    return this.chain.callReadOnlyFn("rewards-v1", "next-rewards-unlock", [], this.deployer.address);
  }

  getPoxCycle() {
    return this.chain.callReadOnlyFn("rewards-v1", "get-pox-cycle", [], this.deployer.address);
  }

  addRewards(caller: Account, pool: string, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("rewards-v1", "add-rewards", [
        types.principal(pool),
        types.uint(amount * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  processRewards(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("rewards-v1", "process-rewards", [
        types.principal(qualifiedName("commission-v2")),
        types.principal(qualifiedName("staking-v1")),
        types.principal(qualifiedName("reserve-v1")),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }
}
export { Rewards };
