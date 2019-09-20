'use strict'

const Promise = require('bluebird');
const mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
const Schema = mongoose.Schema;
let dbSchema = {};

const userSchema = new Schema({
  userName : {
    type: String,
    required: true,
    unique: true
  },
  password : {
    type: String,
    required: true
  },
  theirPublicKey : Array,
  myPublicKey : Array,
  mySecretKey : Array,
  status : {
    type: String,
    required: true
  },
  created_at : {
    type: Number,
    required: true
  },
  updated_at : Number
});

const swarmSchema = new Schema({

})

dbSchema.userSchema = mongoose.model('User', userSchema);
dbSchema.swarmSchema = mongoose.model('Swarm', swarmSchema);
module.exports = dbSchema;
