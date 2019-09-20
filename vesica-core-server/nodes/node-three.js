const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const config = require('../config/app.json')
const logger = require('../utils/logger')()


//Set up peer three node
var peerThree = new PeerInfo(PeerId.create(), []);
peerThree.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/1234'))
var nodeThree = new libp2p.Node(peerThree)


//set up node for node-one-listener to connect to
const privateKeyB = config.privateKey.privateKeyB
const idB = PeerId.createFromPrivKey(privateKeyB)
const peerB = new PeerInfo(idB)
peerB.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/10333'))


//Open connection to node three
nodeThree.start((err) => {
  if (err) {
    logger.logData(err)
  }
})
