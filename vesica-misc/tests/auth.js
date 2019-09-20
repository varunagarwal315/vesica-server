'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id');
const PeerInfo = require('peer-info');
const libp2p = require('../libp2p.js');
const multiaddr = require('multiaddr');
const pull = require('pull-stream');
const async = require('async');
const Pushable = require('pull-pushable');
const app = require('../core/auth/app.json');
const ecdh = require('../components/ecdh.js');
const cipher = require('../components/cipher.js');
const p = Pushable();
let idListener;
const mongoose = require('mongoose');
const bluebird = require("bluebird");
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
let encryption;
mongoose.Promise = bluebird;
const db = mongoose.connect('mongodb://localhost/vesicaTest');

async.parallel([
  (callback) => {
    PeerId.createFromJSON(require('./chat/peer-id-listener'), (err, idDialer) => {
      if (err) {
        throw err
      }
      callback(null, idDialer)
    })
  },
  (callback) => {
    PeerId.createFromJSON(require('../core/auth/peer-auth-id'), (err, idListener) => {
      if (err) {
        throw err
      }
      callback(null, idListener)
    })
  }
], (err, ids) => {
    if (err) throw err
  const peerDialer = new PeerInfo(ids[0])
  peerDialer.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.secondary.port))
  const nodeDialer = new libp2p.Node(peerDialer)

  const peerListener = new PeerInfo(ids[1])
  idListener = ids[1]
  peerListener.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/' + app.primary.port))
  nodeDialer.start((err) => {
    if (err) throw err
    console.log('Secondary node ready');
    nodeDialer.dialByPeerInfo(peerListener, '/auth/1.0.0', (err, conn) => {
      if (err) throw err
      console.log('Secondary dialed to primary node')
      pull(p, conn)
      pull(
        conn,
        pull.drain(function (data) {
          parseIncomingData(data.toString());
        }, function (err) {
          if (err) {
            throw err;
          }
        })
      )
    })/* dialer ends here */

  })
})

function parseIncomingData(data) {
  try {
    let val = JSON.parse(data)
    switch(val.meta.payload){
      case 'authStepTwo' :
      completeKeyExchange(val);
    }
  } catch (e) {
    console.log(e);
  }
}

function completeKeyExchange(val) {
  console.log('completeKeyExchange called');
  let keyPair = ecdh.generateKeyPair();
  let payload = {
    meta : {
      text : "plainText",
      payload : "authStepTwo"
    },
    userName : 'Varun',
    publicKey : keyPair.publicKey,
  }
  p.push(JSON.stringify(payload));
}

process.stdin.setEncoding('utf8')
process.openStdin().on('data', (chunk) => {
  var data = chunk.toString()
  p.push(data)
})


// Input
// {"meta":{"payload":"authStepOne", "text":"plainText"}, "userName" : "Varun"}
