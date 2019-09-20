'use strict'

const crypto = require('crypto');
const Promise = require('bluebird');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
let ecdh = {};

function generateKeyPair() {
  return nacl.box.keyPair()
}

function generateNonce() {
  return nacl.randomBytes(24)
}

// Accepts utf8 string
// Converts to stream, returns hex
function encryptText(text, nonce, theirPublic, mySecret) {
  let cipherarray = (nacl.box(nacl.util.decodeUTF8(text), nonce, theirPublic, mySecret))
  return (new Buffer(cipherarray)).toString('hex')
}

function decryptText(cipherText, nonce, theirPublic, mySecret) {
  let unBox = nacl.box.open((Buffer.from(cipherText, 'hex')), nonce, theirPublic, mySecret)
  return nacl.util.encodeUTF8(unBox)
}

ecdh.generateKeyPair = generateKeyPair
ecdh.generateNonce = generateNonce
ecdh.encryptText = encryptText
ecdh.decryptText = decryptText
module.exports = ecdh

/** For Promise
ecdh.generateKeyPair = Promise.method(() => {
  const pair = crypto.createECDH('secp521r1');
  pair.generateKeys();
  let pairObj = {};
  pairObj.publicKey = pair.getPublicKey();
  pairObj.privateKey = pair.getPrivateKey();
  return pairObj;
});

ecdh.computeSecret = Promise.method((keyPair, pubKey) => {
  const pair = crypto.createECDH('secp521r1');
  pair.setPrivateKey(keyPair.privateKey);
  pair.setPublicKey(keyPair.publicKey);
  return pair.computeSecret(pubKey);
});
**/
