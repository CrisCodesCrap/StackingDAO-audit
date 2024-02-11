import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Data Core
// ---------------------------------------------------------

class DataCore {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getStxPerStStx(reserveContract: string) {
    return this.chain.callReadOnlyFn("data-core-v1", "get-stx-per-ststx", [
        types.principal(reserveContract)
    ], this.deployer.address);
  }

  getStxPerStStxHelper(amount: number) {
    return this.chain.callReadOnlyFn("data-core-v1", "get-stx-per-ststx-helper", [
        types.uint(amount * 1000000)
    ], this.deployer.address);
  }

  getCycleWithdrawOffset() {
    return this.chain.callReadOnlyFn("data-core-v1", "get-cycle-withdraw-offset", [
    ], this.deployer.address);
  }

  getWithdrawalsByNft(nftId: number) {
    return this.chain.callReadOnlyFn("data-core-v1", "get-withdrawals-by-nft", [
        types.uint(nftId)
    ], this.deployer.address);
  }

}
export { DataCore };
