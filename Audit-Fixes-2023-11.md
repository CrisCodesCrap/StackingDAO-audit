# Audit

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
