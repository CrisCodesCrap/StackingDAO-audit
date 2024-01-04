// SerializeP2PKH = 0x00,  // hash160(public-key), same as bitcoin's p2pkh
// SerializeP2SH = 0x01,   // hash160(multisig-redeem-script), same as bitcoin's multisig p2sh
// SerializeP2WPKH = 0x02, // hash160(segwit-program-00(p2pkh)), same as bitcoin's p2sh-p2wpkh
// SerializeP2WSH = 0x03,  // hash160(segwit-program-00(public-keys)), same as bitcoin's p2sh-p2wsh

const bech32 = require('@scure/base');
const tx = require('@stacks/transactions');

const btc = require('bitcoinjs-lib');
const btcAddress = 'bc1q9ll6ngymkla8mnk5fq6dwlhgr3yutuxvg3whz5';
const stacking = require('@stacks/stacking');

// For legacy addresses
// console.log('0x' +  btc.address.fromBase58Check(btcAddress).hash.toString('hex'));

// For native segwit
// const data = stacking.poxAddressToTuple(btcAddress);
const data = stacking.decodeBtcAddress(btcAddress);
// console.log(new TextDecoder().decode(data['data']));

console.log('Raw data:', data);
console.log('0x0' + data['version']);
const address = Buffer.from(data['data']).toString('hex');
console.log('0x' + address);

// console.log(data['data']);
// console.log(tx.bufferCV(data['data']));

// console.log(stacking.poxAddressToTuple(btcAddress));
// console.log(stacking.extractPoxAddressFromClarityValue(stacking.poxAddressToTuple(btcAddress)));

// const allData = bech32.bech32.decode(btcAddress);
// console.log(allData);
// console.log(bech32.bech32.fromWords(bech32Words.slice(1)));


// Back to BTC address
// { version: 0x04, hashbytes: 0x2fffa9a09bb7fa7dced44834d77ee81c49c5f0cc })

const encoded = Uint8Array.from(address.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
const converted = stacking.poxAddressToBtcAddress(4, encoded, 'mainnet');
console.log(converted);