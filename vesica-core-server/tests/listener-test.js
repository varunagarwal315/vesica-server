'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const config = require('../config/app.json');

const privateKeyB = config.privateKey.privateKeyB

const idB = PeerId.createFromPrivKey(privateKeyB)
const peerB = new PeerInfo(idB)
peerB.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/10333'))
const nodeB = new libp2p.Node(peerB)

nodeB.start((err) => {
  if (err) throw err
})


setTimeout(handle,1000)


function handle(){
  nodeB.handle('/echo/1.0.0', (conn) => {
    process.stdin.pipe(conn)
    conn.pipe(process.stdout)
  })
}


  console.log('Listener node is ready')
  console.log('->', peerB.multiaddrs[0].toString())
  console.log('->', peerB.id.toB58String())
