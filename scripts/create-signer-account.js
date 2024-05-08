const tx = require('@stacks/transactions');

const privateKey = tx.createStacksPrivateKey("753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601");
console.log("privateKey", privateKey.data.toString('hex'));

// Get public key from private
const publicKey = tx.getPublicKey(privateKey);
console.log("publicKey", publicKey.data.toString('hex'));

// Get address
const stacksAddress = tx.getAddressFromPrivateKey(
  tx.privateKeyToString(privateKey),
  tx.TransactionVersion.Testnet // remove for Mainnet addresses
);
console.log("stacksAddress", stacksAddress);
