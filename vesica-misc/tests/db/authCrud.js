'use strict'

const authCrud = require('../../core/auth/authCrud.js');
const userCrud = require('../../core/auth/userCrud.js');
const cipher = require('../../components/cipher.js');
const mongoose = require('mongoose');
const bluebird = require("bluebird");
mongoose.Promise = bluebird;
const db = mongoose.connect('mongodb://localhost/vesicaTest');
const publicKey = '0401572dbe2198215d78ddc6d8c3dafa9e113c9f02bcf60cd88e2ba9fd0942ac0c49397cc328c249ef131899e668692b0a3ae050ac950674865873f1274cd3bed89bab003727cd9e466de46e70c9c7182a6fa170ebe94f95eb1e6f6c6c6ec22ba02b79a4003b03d26ead500570bbcb33f5f0666193e917c664956629b752b317544c42c086';
const privateKey = '171834cfaaacfd652b613d5f2be9b2c5e48f09e0d59959731d01962b98d4118be2565b9e9a0dc7d2536e2acd81fd3585d0335a252b85b3c3fe83f0a7d92818541f';
const otherPubKey = '0401acf4a3dc9a03229a4d1a0502676500739d8bfa0d7db48e99be22cf0984cd181bd0bd72c9c4d7024688ba1ddbcd84e79ea95e7af9e64bc17b04d0b2cf42675b045501dfc0d8ec574b5c37177d11f77680df612087b563caa547d49faa9f2376304f45e59582b5afe7bdc8b1828bfaad5ac82905b8a2c30895d04031c990f7d3cae2f364'
const secretKey = '01eae7e3dce7f7b699f5241f4aeb6eb0f9e85018bbfff5c7458a2283d16c0ed23e69c760d15443f5750c5a5cdaaa4a61f406c58d75019c042d07a066ab5fc88b6f1f';
const stepOneData = {
  userName : "TestSubject",
  publicKey : publicKey.toString('hex'),
  privateKey : privateKey.toString('hex')
}
const stepTwoData = {
  userName : "TestSubject",
  secretKey : secretKey.toString('hex')
}
const stepThreeData = {
  userName : "TestSubject",
  password : "123"
}
const cleanUpData = {
  userName : "TestSubject"
}
const hashedPassword = '$2a$10$j3t.9HduW01JHpqLE5xPWOUS680Yn12HGN5BN.LXgeyzULMN2Vszy';
const encryptedPw = 'e9c1ace795da6eceb364c721fad279f471bdaed45266c14c525f10c233ea7f0e3b87d6c6dcd5fd72baa3008078cfc39cc554b82590272245c69aff0a42f8a551';

// All auth steps in combination
authCrud.stepOneAuthRequest(stepOneData)
  .then(user => {
    console.log('first step');
    return authCrud.searchUserFromAuthDb('TestSubject')
  })
  .then(user => {
    console.log('found user ' + user)
    user.secretKey = secretKey;
    return user.saveAsync()
  })
  .then(user => {
    console.log('search user from userDb');
    return userCrud.searchUserFromUserDb("TestSubject")
  })
  .then(user => {
    console.log('create decipher key');
    return cipher.createDecipher(secretKey)
  })
  .then(decipherVal => {
    console.log('decrypt the password');
    return cipher.decryptText(decipherVal, encryptedPw)
  })
  //.then(pw => authCrud.checkPasswordSignature(pw)) TODO: Add this soon
  .then(pw => {
    console.log('check password in user db');
    return authCrud.checkUserPassword(pw, stepOneData)
  })
  .then(result => console.log(result))
  .catch(err => console.log(err));
