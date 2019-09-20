'use strict'

const crud = require('../../core/auth/userCrud.js');
const mongoose = require('mongoose');
const bluebird = require("bluebird");
mongoose.Promise = bluebird;
const db = mongoose.connect('mongodb://localhost/vesicaTest');

crud.createUser({userName : 'Varun', password : '123'})
  .then(user => console.log(user))
  .catch(err => console.log(err))
