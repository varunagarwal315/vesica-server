'use strict'

const mySchema = require('../../components/schema.js');
const userSchema = mySchema.userSchema;
const initAuthSchema = mySchema.initAuthSchema;
const cipher = require('../../components/cipher.js');
const Promise = require("bluebird")
const bcrypt = Promise.promisifyAll(require('bcrypt'));

let userCrud = {};

//TODO: Testing is left
let createUser = (data) => {
  return new Promise(resolve => {
    console.log(data);
    if (!data) throw new Error(', pass user params!')
    bcrypt.genSaltAsync(10)
      .then(salt =>  {
        console.log(salt);
        return bcrypt.hashAsync(data.password, salt)
      })
      .then(hash => {
        console.log(hash);
        const user = new userSchema({
            userName : data.userName,
            password : hash,
            status : 'active', // Make dormant?
            created_at : Date.now()
        })
        resolve(user.saveAsync());
      })
  })
};

// Check if the user exists in the actual user db
function searchUserFromUserDb(username) {
  return new Promise((resolve, reject) => {
    if (!username) {
      throw new Error(', pass the userName at least')
    }
    userSchema.find({userName : username}, (err, user, num) => {
      if (err) {
        reject(err)
      }else {
        if (user.length > 0) {
          resolve(user[0]);
        }else {
          //TODO: Unauthorized login? FLAG THIS AND SEND ALERT TO ADMIN
          reject('User not found in userDb');
        }
      }
    })
  });
}

userCrud.createUser = createUser;
userCrud.searchUserFromUserDb = searchUserFromUserDb;
module.exports = userCrud;
