import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Commission
// ---------------------------------------------------------

class Commission {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getContractsEnabled() {
    return this.chain.callReadOnlyFn("commission-v1", "get-staking-percentage", [
    ], this.deployer.address);
  }

  addCommission(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("commission-v1", "add-commission", [
        types.principal(qualifiedName("staking-v1")),
        types.uint(amount * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  withdrawCommission(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("commission-v1", "withdraw-commission", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setStakingPercentage(caller: Account, percentage: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("commission-v1", "set-staking-percentage", [
        types.uint(percentage * 10000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { Commission };
