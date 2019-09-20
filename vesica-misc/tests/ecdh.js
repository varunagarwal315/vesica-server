'use strict'

const ecdh = require('../components/ecdh.js');
const assert = require('assert');
const crypto = require('crypto');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

const theirPair = ecdh.generateKeyPair()
const myPair = ecdh.generateKeyPair()
let nonce = nacl.randomBytes(24)
let temp = theirPair.publicKey.toString('hex')
console.log(temp);
console.log(Buffer.from(temp, 'hex'));
// payload is type 'hex'
let payload = ecdh.encryptText('hi varun', nonce, theirPair.publicKey, myPair.secretKey)
let plainText = ecdh.decryptText(payload, nonce, myPair.publicKey, theirPair.secretKey)
console.log(plainText);


/** OLD ECDH USING secp256k1 */
// Functions are synchronous. Promise.method() can be used safely
// const alicePair = ecdh.generateKeyPair();
// const bobPair = ecdh.generateKeyPair();
//
// const aliceSecret = ecdh.computeSecret(alicePair, bobPair.publicKey);
// const bobSecret = ecdh.computeSecret(bobPair, alicePair.publicKey);
//
// // No error implies assertion test has been cleared
// assert.deepEqual(aliceSecret, bobSecret);
// console.log(aliceSecret.toString('hex'));
//
//
// let bobPubKey = Buffer.from(bobPair.publicKey.toString('hex'), 'hex');
// let keyPair = ecdh.generateKeyPair();
// let secretKey = ecdh.computeSecret(keyPair, bobPubKey);
//
// console.log('\n\n');
// console.log('secret key \n' + secretKey.toString('hex'));
// console.log('priv/ pub pair ' + '\n' + alicePair.privateKey.toString('hex')
//   + '\n' + alicePair.publicKey.toString('hex'));
// console.log('bob pub key \n' + bobPair.publicKey.toString('hex'));
//
// // Android test  const pair = crypto.createECDH('secp521r1')
// const pair = crypto.createECDH('secp256k1')
// pair.setPrivateKey(Buffer.from('3056301006072a8648ce3d020106052b8104000a03420004320fab37628c620992389bc3dd09467826750e4fb977c4c01ea898074723b68fdc9b9e9bc737bc36a8a225e096d4140e91370ed81068e1e453e4a4ed3e1a9fe2', 'hex'))
// pair.setPublicKey('30818d020100301006072a8648ce3d020106052b8104000a04763074020101042078de19ba4686594df05b725775d882e06fa2b9db4d96b44d981dc2e24b0f5201a00706052b8104000aa14403420004320fab37628c620992389bc3dd09467826750e4fb977c4c01ea898074723b68fdc9b9e9bc737bc36a8a225e096d4140e91370ed81068e1e453e4a4ed3e1a9fe2', 'hex')
// let secretKeyAndroid = ecdh.computeSecret(pair, bobPubKey);
// let secretKeyAndroidBob = ecdh.computeSecret(bobPubKey, pait.getPublicKey());
// console.log(secretKeyAndroid);
// console.log(secretKeyAndroidBob);
