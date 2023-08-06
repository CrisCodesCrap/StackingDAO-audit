import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './sticky-tests-utils.ts';

// ---------------------------------------------------------
// Sticky DAO
// ---------------------------------------------------------

class StickyDAO {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getContractsEnabled() {
    return this.chain.callReadOnlyFn("sticky-dao", "get-contracts-enabled", [
    ], this.deployer.address);
  }

  getContractActive(address: string) {
    return this.chain.callReadOnlyFn("sticky-dao", "get-contract-active", [
      types.principal(address)
    ], this.deployer.address);
  }

  checkIsEnabled(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-dao", "check-is-enabled", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  checkIsProtocol(caller: Account, address: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-dao", "check-is-protocol", [
        types.principal(address),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setContractsEnabled(caller: Account, enabled: boolean) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-dao", "set-contracts-enabled", [
        types.bool(enabled),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  setContractActive(caller: Account, address: string, active: boolean) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-dao", "set-contract-active", [
        types.principal(address),
        types.bool(active),
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyDAO };
