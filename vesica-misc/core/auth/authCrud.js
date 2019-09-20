'use strict'

const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const mySchema = require('../../components/schema.js');
const cipher = require('../../components/cipher.js');
const userSchema = mySchema.userSchema;
const ecdh = require('../../components/ecdh.js');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

let authCrud = {}

// Receive the auth request data, userName, ecdh public and private key pair which is stored
let updateUserWithKeyPair = Promise.method((user) => {
      console.log('generating keys for users');
      user.status = 'active', // Make dormant?
      user.created_at = Date.now()
      let keyPair = ecdh.generateKeyPair();
      user.myPublicKey = keyPair.publicKey;
      user.mySecretKey =  keyPair.secretKey;
      return user.saveAsync()
})


function stepTwoAuthRequest(data) {
  let newUserData = data;
  searchUserFromAuthDb(data.userName)
    .then(user => {
      // Update using newUserData with the secret key
      user.mySecretKey = data.mySecretKey;
      return user.saveAsync();
    })
}

function stepThreeAuthRequest(data) {
  let userData = data;
  let sentPw;
  userCrud.searchUserFromUserDb(userData.userName)
    .then(user => cipher.createDecipher(user.secretKey))
    .then(pw => checkUserPassword(pw, userData))
}

function cleanUpAuthRequest(data) {
  searchUserFromAuthDb(data.userName)
    .then(user => {
      // Delete the user and clear all cache if any
    })
}

function deleteAuthRequestData(username) {
  return new Promise(function(resolve, reject) {
    if (!username) {
      throw new Error('Idiot, pass the userName at least')
    }
  });
}

// Pull the username from auth db to add in the keys
let searchUserFromAuthDb = (username) => {
  console.log('searching for ' + username);
  return new Promise((resolve, reject) => {
    if (!username) {
      throw new Error('Idiot, pass the userName at least')
    }
    userSchema.find({userName : username}, (err, user, num) => {
      if (err) {
        reject(err)
      }else {
        if (user.length > 0) {
          resolve(user[0]);
        }else {
          //TODO: Unauthorized login? FLAG THIS AND SEND ALERT TO ADMIN
          reject('User not found in authDb');
        }
      }
    })
  });
}

function checkPasswordSignature(data) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSaltAsync(10)
      .then(salt =>  {
        return bcrypt.compareAsync(data.password, salt)
      })
      .then(result => {
        if (result) {
          resolve(result); // Signature is valid, do something with it now
        }else {
          reject('Invalid password signature'); // Major flag, means password was signed using an unknown salt
        }
      })
      .catch(err => reject(err));
  });
}

function checkUserPassword(pw, userData) {
  return new Promise(function(resolve, reject) {
    userCrud.searchUserFromUserDb(userData.userName)
      .then(user => {
        if (pw === user.password) {
          resolve(true); // User authenticated
        }else {
          reject('Invalid login credentials');
        }
      })
  });
}

authCrud.searchUserFromAuthDb = searchUserFromAuthDb;
authCrud.updateUserWithKeyPair = updateUserWithKeyPair;
authCrud.stepTwoAuthRequest = stepTwoAuthRequest;
authCrud.stepThreeAuthRequest = stepThreeAuthRequest;
authCrud.cleanUpAuthRequest = cleanUpAuthRequest;
authCrud.deleteAuthRequestData = deleteAuthRequestData;
authCrud.checkPasswordSignature = checkPasswordSignature;
authCrud.checkUserPassword = checkUserPassword;
module.exports = authCrud;
