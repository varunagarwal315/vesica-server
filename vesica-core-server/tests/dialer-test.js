'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const config = require('../config/app.json');

const privateKeyA= config.privateKey.privateKeyA
const privateKeyB= config.privateKey.privateKeyB

// Creation of PeerInfo of Dialer Node (this node)
const idA = PeerId.createFromPrivKey(privateKeyA)
const peerA = new PeerInfo(idA)
peerA.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
const nodeA = new libp2p.Node(peerA)

// Creation of PeerInfo of Listener Node
const idB = PeerId.createFromPrivKey(privateKeyB)
const peerB = new PeerInfo(idB)
peerB.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/10333'))

nodeA.start((err) => {
  if (err) {
    throw err
  }
})

setTimeout(dial,1000)

function dial(){
  nodeA.dialByPeerInfo(peerB, '/echo/1.0.0', (err, conn) => {
    if (err) {
      throw err
    }
    console.log('nodeA dialed to nodeB on protocol: /echo/1.0.0')
    process.stdin.pipe(conn)
    conn.pipe(process.stdout)
  })
}
