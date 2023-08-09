import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';
import { qualifiedName } from './tests-utils.ts';

// ---------------------------------------------------------
// Sticky Tax
// ---------------------------------------------------------

class Tax {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  handleTax(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("tax-v1", "handle-tax", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  retreiveTokens(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("tax-v1", "retreive-tokens", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { Tax };
