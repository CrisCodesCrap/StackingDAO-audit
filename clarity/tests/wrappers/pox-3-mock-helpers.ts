import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// PoX-3 Mock
// ---------------------------------------------------------

class Pox3Mock {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  burnHeightForRewardCycle(height: number) {
    return this.chain.callReadOnlyFn("pox-3-mock", "burn-height-to-reward-cycle", [
      types.uint(height),
    ], this.deployer.address);
  }

  getStackerInfo(stacker: string) {
    return this.chain.callReadOnlyFn("pox-3-mock", "get-stacker-info", [
      types.principal(stacker),
    ], this.deployer.address);
  }

  unlock(caller: Account, account: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("pox-3-mock", "unlock-mock", [
        types.principal(account),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  allowContractCaller(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("pox-3-mock", "allow-contract-caller", [
        types.principal(qualifiedName("pox-fast-pool-v2-mock")),
        types.none()
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }


}
export { Pox3Mock };
