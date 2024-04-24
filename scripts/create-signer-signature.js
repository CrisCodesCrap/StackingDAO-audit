const secp256k1 = require('secp256k1')

// Private key to sign
// NOTE: REMOVE '01' AT END OF ACTUAL KEY
const privateKey = Buffer.from("753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a6", "hex");

// Message to sign
const message = Buffer.from("661a1ac9ba293568568a2580daad762f64a833435c174346250d60dbffe51aaa", "hex");

// Get the public key in a compressed format
const publicKey = secp256k1.publicKeyCreate(privateKey)
console.log("Public key:", Buffer.from(publicKey).toString("hex"));

// Get signature
const signatureObject = secp256k1.ecdsaSign(message, privateKey)
console.log("Signature object:", signatureObject);

// Append recovery ID to signature
const recoveryId = new Uint8Array([signatureObject.recid]);
var mergedArray = new Uint8Array(signatureObject.signature.length + recoveryId.length);
mergedArray.set(signatureObject.signature);
mergedArray.set(recoveryId, signatureObject.signature.length);
console.log("Full signature:", Buffer.from(mergedArray).toString("hex"));

// verify the signature
const verificationResult = secp256k1.ecdsaVerify(signatureObject.signature, message, publicKey);
console.log("Verification result:", verificationResult);
