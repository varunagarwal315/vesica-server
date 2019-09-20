'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const config = require('../config/app.json')
const logger = require('../utils/logger')()
const privateKeyA= config.privateKey.privateKeyA
const privateKeyB= config.privateKey.privateKeyB
var dialerEmitter = require('../utils/event-emitter')().dialerEmitter
var message = require('../pojo/message')()
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
    logger.logData(err)
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

    conn.on('data', function(chunk) {
       var data=''
       data += chunk;
       try {
         var dataAsJson = JSON.parse(data);
         logger.logData(data);
         dialerEmitter.emit(config.emitter.libp2p.newMessage, data)
         //checkTypeOfMessage(dataAsJson, conn)
       } catch (e) {
         logger.logData(e);
         logger.logData(data);
       } finally {
         //nothing
       }
    })//conn.on closes

    dialerEmitter.on(config.emitter.socket.newMessage, (data)=>{
      conn.write(data.toString(),'utf-8',(err)=>{
        if (err) {
          logger.logData(err);
        }
      })
    })
  })
}



function checkTypeOfMessage(jsonPayload, conn){
    switch (jsonPayload.type) {
      //TODO
      case "newUser":
        dialerEmitter.emit('newUser',jsonPayload, conn)
        break;

      //@First step is to get this working
      case "newMessage":
        dialerEmitter.emit(config.emitter.libp2p.newMessage,jsonPayload, conn)
        break;
        //TODO
      case "userDisconnected":
        dialerEmitter.emit('newUser',jsonPayload, conn)
        break;

      default:
        logger.logData('error in switch statement- '+jsonPayload.type)
    }
}



///Code for Socket.io. PORT IS 8000s
//TODO: Shift to separate module later on

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var request = require('request');
//Port is 8000
var port = config.socket.portDialer;
var userMapping=[]
var userList=[]


server.listen(port, ()=> {
  console.log('Server listening at port %d', port);
});

io.on('connection', (socket)=>{
  console.log('new connection received');
  //when user sends a message through the socket.io


  socket.on('new_message', (data)=>{
    console.log('received from socket');
    logger.logData(data);
    socket.broadcast.emit('new_message', data)

    dialerEmitter.emit(config.emitter.socket.newMessage,data)
  })//socket.on(new_message) closes


  socket.on('new_user', (data)=>{
    console.log(data);
    var data = JSON.parse(data)
    console.log('new user joined '+data.username);
    userMapping.push( {socketId: socket.id, username: data.username, port: config.socket.portDialer} );
    console.log(userMapping);

    io.emit('dialerEmitter',userMapping);
    dialerEmitter.emit('new_user', userMapping)

    var userData = {socketId: socket.id, username: data.username, port: config.socket.portListener}

    request.post({url:'http://127.0.0.1:5555/newUser', json: userData}, function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error('upload failed:', err);
      }
      console.log('Upload successful!  Server responded with:', body);
    });

  })


    socket.on('disconnect', ()=>{
      console.log('disconnect called');
      try {
        for (var i = 0; i < userMapping.length; i++) {
          if (userMapping[i].socketId == socket.id) {
              userMapping.splice(i,1)
              break
          }
        }
        console.log(userMapping);
      } catch (e) {
        console.log(e);
      } finally {
      }
    })



  dialerEmitter.on(config.emitter.libp2p.newMessage, (data)=>{
    //send message via socket to
    socket.emit('new_message',data)
  })
})
