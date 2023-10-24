
# StackingDAO

Enhance the liquidity of stacked tokens within the Stacks ecosystem by unlocking your STX with stSTX, the most seamlessly integrated liquid stacking token.

Learn more at [StackingDAO Website](https://stackingdao.com/) or follow us on [Twitter](https://twitter.com/stackingdao).

## Contracts

### User
Users interact with the `core` contract to either deposit STX for stSTX or perform the reverse operation.

### Stacking
The `reserve` contract safeguards STX tokens and keeps track of the stacked STX and STX required for withdrawals. During each cycle, the `strategy` contract calculates the inflow or outflow of STX. Based on these calculations, the `strategy` contract manages stacking through multiple `stacker` contracts. This design enables partial unstacking of STX if there is an outflow.

At the end of a stacking cycle, BTC rewards are manually converted to STX and added to the `core` contract. These rewards are distributed to stSTX holders, with a portion retained as a commission. The `commission` contract retains a segment as protocol revenue and distributes the rest to stakers through the `staking` contract.

### Tax
When exchanging stSTX or STDAO, a buy and sell tax is imposed. The `tax` contract harnesses these taxes to enhance liquidity.

### Tokens
The liquid stacking token is `stSTX`, and `STDAO` serves as the DAO token. Additionally, an `ststx-withdraw` NFT represents the initiation of a withdrawal.

## Web

Next.js app.