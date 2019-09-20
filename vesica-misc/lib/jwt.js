'use strict'

const jwt = require('jsonwebtoken')
const jwtSecret = "vesica123"
const jwtObj = {}

jwtObj.generateToken = (user) => {
  return jwt.sign("val", jwtSecret)
}

jwtObj.validateToken = (jwtToken) => {
  return jwt.verify(jwtToken, jwtSecret)
}


module.exports = jwtObj
