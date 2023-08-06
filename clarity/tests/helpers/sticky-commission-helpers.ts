import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet/index.ts';

// ---------------------------------------------------------
// Sticky Commission
// ---------------------------------------------------------

class StickyCommission {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  addCommission(caller: Account, amount: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-commission-v1", "add-commission", [
        types.uint(amount * 1000000)
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

  withdrawCommission(caller: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall("sticky-commission-v1", "withdraw-commission", [
      ], caller.address)
    ]);
    return block.receipts[0].result;
  }

}
export { StickyCommission };
