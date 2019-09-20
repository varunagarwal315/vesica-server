'use strict'
/** NO LONGER IN USE AS KDF IS NOT NEEDED FOR EC25519*/
const cipher = require('../components/cipher.js');

// Expected output 597f36dd4d4ae0adaf171b1317e998aa
cipher.createCipher('01eae7e3dce7f7b699f5241f4aeb6eb0f9e85018bbfff5c7458a2283d16c0ed23e69c760d15443f5750c5a5cdaaa4a61f406c58d75019c042d07a066ab5fc88b6f1f')
  .then(data => cipher.encryptText(data, '$2a$10$j3t.9HduW01JHpqLE5xPWOUS680Yn12HGN5BN.LXgeyzULMN2Vszy'))
  .then(data => console.log(data))
  .catch(err => console.log(err));

// Expected output hello world
cipher.createDecipher('secretWord')
  .then(decipher => cipher.decryptText(decipher, '597f36dd4d4ae0adaf171b1317e998aa'))
  .then(data => console.log(data))
  .catch(err => console.log(err));

function completeFlowCheck(passphrase, plainText) {
  let cipherText = '';
  cipher.createCipher('secretWord')
    .then(data => cipher.encryptText(data, plainText))
    .then(ct => {
      cipherText = ct;
      return cipher.createDecipher('secretWord')
    })
    .then(decipher => cipher.decryptText(decipher, cipherText))
    .then(plainText => console.log(plainText))
    .catch(err => console.log(err));
}

// Output should be the 2nd param input
completeFlowCheck('secret', 'hello varun');
