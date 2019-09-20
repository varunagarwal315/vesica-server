'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id');
const PeerInfo = require('peer-info');
const mongoose = require('mongoose');
const bluebird = require("bluebird");
const multiaddr = require('multiaddr');
const pull = require('pull-stream');
const Pushable = require('pull-pushable');
const events = require('events')
const libp2p = require('../../libp2p.js');
const app = require('./app.json');
const authCrud = require('./authCrud.js')
const ecdh = require('../../components/ecdh.js');
const cipher = require('../../components/cipher.js');
const p = Pushable();
const EE = new events.EventEmitter();
mongoose.Promise = bluebird;
const db = mongoose.connect('mongodb://localhost/vesicaTest');
let encryption;
let arr = {};

PeerId.createFromJSON(require('./peer-auth-id'), (err, authId) => {
  if (err) throw err
  setStuffUp(authId);
})

function setStuffUp(authId) {
  const peerAuth = new PeerInfo(authId);
  peerAuth.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.primary.port));
  const nodeAuth = new libp2p.Node(peerAuth);
  nodeAuth.start((err) => {
    if (err) throw err
    nodeAuth.swarm.on('peer-mux-established', (newPeerInfo) => {
      console.log('connection received from ' + newPeerInfo.id.toB58String());
    })
    console.log('Auth server ready, listening on:')
    peerAuth.multiaddrs.forEach((ma) => {
      console.log(ma.toString() + '/ipfs/' + authId.toB58String());
    })

    // Receive data from a node
    nodeAuth.handle('/auth/1.0.0', (protocol, conn) => {
      pull(p, conn)
      pull(conn,
        pull.drain(function (data) {
          parseIncomingData(data.toString());
        }, function (err) {
          if (err) {
            throw err;
          }
        }))
    })/* Handler one ends */
  })
}

// Input data from command line
process.stdin.setEncoding('utf8');
process.openStdin().on('data', (chunk) => {
  var data = chunk.toString();
  p.push(data)
})

// Check if plainText or cipherText
function parseIncomingData(data) {
  console.log(data.toString());
  //TODO: Make this a fatal crash during proper testing
  try {
    let val = JSON.parse(data);
    switch (val.meta.text) {
      case 'plainText':
        console.log('data is plainText');
        parsePlainText(val);
        break;

      case 'cipherText':
        console.log('data is cipherText');
        parseCipherText(val);
        break;

      default:
      console.log('Default came. Crashed bruh');
      break;
    }
  } catch (e) {
    console.log(e);
  }
}

// Parse plain text data
function parsePlainText(val) {
//TODO: Make this a fatal crash during proper testing
  switch (val.meta.payload) {
    case 'authStepOne':
      authStepOne(val);
      break;

      case 'authStepTwo':
      authStepTwo(val);
      break;

      default:
  }
}

// Parse cipher text data
function parseCipherText(val) {
//TODO: Make this a fatal crash during proper testing
  switch (val.meta.payload) {
    case 'authStepOne':
      initAuth(val);
      break;

      case 'completeKeyExchange':
      console.log('VAL PUBLIC KEY ' + val.publicKey);
      completeKeyExchange(val);
      break;

      default:
  }
}

// Initiate new request for authentication
// Check if username actually exists. Reject or proceed to setup key exchange
// Send payload with public key, store reference to it in mongo db (temp)
// Receive data back, create cipher, delete mongo db data and expire session
// TODO: Clean this, make the promises aligned. Split the last promise into two?
function authStepOne(val) {
  console.log('authStepOne called');
  authCrud.searchUserFromAuthDb(val.userName)
  .then((user) => authCrud.updateUserWithKeyPair(user))
  .then((user) => {
    var payload = {
      meta : {
        text : "plainText",
        payload : "authStepTwo"
      },
      publicKey : user.myPublicKey,
      userName : val.userName
    }
      p.push(JSON.stringify(payload));
      console.log('auth step one done');
  })
  .catch(err => console.log('error in authStepOne ' + err));
}

function authStepTwo(val) {
  const data = val;
  console.log('authStepTwo called');
  authCrud.searchUserFromAuthDb(data.userName)
    .then(user => {
      user.theirPublicKey = data.publicKey
      return user.saveAsync();
    })
    .then(user => console.log('auth step two done'))
    .catch(err => console.log('error in authStepTwo' + err));
}

function authStepThree() {
  // Check the password in this
}
