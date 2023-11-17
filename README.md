
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

### Tests
Tests can be found in the `tests` folder and are written using [Clarinet](https://github.com/hirosystems/clarinet).

### Mocks
Mock contracts can be found in the `contracts/tests` folder. 

The `swap` mock contract is a replication from Bitflow, the decentralized exchange (DEX) for swapping protocol tokens. This `swap` contract is used for tax management through the `tax` contract.

It's currently not possible to achieve full PoX functionality within unit tests. The primary challenge stems from the fact that values in the `stx-account` are not dynamically updated. This necessity led to the introduction of the mock contract. The information that the `stx-account` should ideally provide is stored in a separate map and can be retrieved using the `stx-account-mock` method.  Another issue arises when tokens need to be unlocked. The tokens are not automatically returned to the owner and the information in `stx-account` is not updated. To address this, a method named `unlock-mock` was introduced, allowing manual unlocking of STX tokens during testing.

## Web

Next.js app.

## Audit

Audit performed by CoinFabrik based on commit `3a799d246991fc1ea5652d4c587b81a04d8f59eb`.

Below the details for each issue.

### CR-01 Blocked Withdrawals and Stolen Rewards
- Removed the withdrawal restrictions
- Resolved MI-02 and MI-03.

### CR-02 Reward Miscalculation
- There is now a specific end block at which the reward distribution stops 
- When rewards are added multiple times the correct amount to distribute per block is calculated

### CR-03 Update Codebase for Mainnet
- Execute planned modifications for mainnet (set mainnet addresses instead of mocknet addresses).

### MI-01 Panicking on Possible Error
- Replaced unwrap-panic for unwrap!

### MI-02 No Limit for the Reward Commission
- Defined a maximum value (20%) for the commission and enforced it.

### MI-03 No Limit for the Staking Percentage
- Defined a minimum value (70%) for staking percentage and enforced it.

### MI-04 Any Whitelisted Principal Can Disable Others
- Defined a separate admin role
- Only admin can use DAO methods `set-contracts-enabled`, `set-contract-active` and `set-admin`
- The idea is that the deployer address will be replaced by a governance contract later

### EN-01 Remove Duplicated Validation
- Removed the assertion as this check already happens in `get-stx-per-ststx`.

### EN-02 Avoid Repetition
- Did not make the change as it's not possible to store a list of contract addresses, and use an element of that list to make a contract call
- It would technically be possible to have a parameter that accepts a list of stacker traits. 

### TG The `can-stack` function on PoX requires a parameter `first-reward-cycle` but a burn height is passed
- Removed the `pox-can-stack-stx` method. It was a duplicated check, because later in the code the `stack-stx` method on PoX is called which will already check `can-stack-stx`
