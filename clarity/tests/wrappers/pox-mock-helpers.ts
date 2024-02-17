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

}
export { Pox3Mock };

// ---------------------------------------------------------
// PoX-4 Mock
// ---------------------------------------------------------

class Pox4Mock {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  burnHeightForRewardCycle(height: number) {
    return this.chain.callReadOnlyFn("pox-4-mock", "burn-height-to-reward-cycle", [
      types.uint(height),
    ], this.deployer.address);
  }

  getStackerInfo(stacker: string) {
    return this.chain.callReadOnlyFn("pox-4-mock", "get-stacker-info", [
      types.principal(stacker),
    ], this.deployer.address);
  }

  getCheckDelegation(stacker: string) {
    return this.chain.callReadOnlyFn("pox-4-mock", "get-check-delegation", [
      types.principal(stacker),
    ], this.deployer.address);
  }

  getPartialStackedByCycle(rewardCycle: number, pool: string) {
    return this.chain.callReadOnlyFn("pox-4-mock", "get-partial-stacked-by-cycle", [
      types.tuple({ 'version': '0x00', 'hashbytes': '0xf632e6f9d29bfb07bc8948ca6e0dd09358f003ac'}),
      types.uint(rewardCycle),
      types.principal(pool),
    ], this.deployer.address);
  }

  unlock(caller: Account, account: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("pox-4-mock", "unlock-mock", [
        types.principal(account),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  allowContractCaller(caller: Account, contract: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("pox-4-mock", "allow-contract-caller", [
        types.principal(contract),
        types.none()
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }


}
export { Pox4Mock };
