'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const config = require('../config/app.json');
const logger = require('../utils/logger')();
const privateKeyB = config.privateKey.privateKeyB
var listenerEmitter = require('../utils/event-emitter')().listenerEmitter
const idB = PeerId.createFromPrivKey(privateKeyB)
const peerB = new PeerInfo(idB)
peerB.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/10333'))
const nodeB = new libp2p.Node(peerB)

nodeB.start((err) => {
  if (err) logger.logData(err)
})


setTimeout(handle,1000)

function handle(){
  nodeB.handle('/echo/1.0.0', (conn) => {
    process.stdin.pipe(conn)

    conn.on('data', function(chunk) {
       var data=''
       data += chunk;
       try {
         var dataAsJson = JSON.parse(data);
         logger.logData(data);
         listenerEmitter.emit(config.emitter.libp2p.newMessage,data)
         //checkTypeOfMessage(dataAsJson)
       } catch (e) {
         logger.logData(e);
         logger.logData(data);
       } finally {
         //nothing
       }

    });//conn.on closes

    listenerEmitter.on(config.emitter.socket.newMessage, (data)=>{
      conn.write(data.toString(),'utf-8',(err)=>{
        if (err) {
          logger.logData(err);
        }

      })
    })

    listenerEmitter.on('new_user', (userMapping)=>{

      conn.write(userMapping.toString(), 'utf-8')
    })
  })
}


  console.log('Listener node is ready')
  console.log('->', peerB.multiaddrs[0].toString())
  console.log('->', peerB.id.toB58String())

  function checkTypeOfMessage(jsonPayload){
      switch (jsonPayload.type) {
        case "newUser":
          listenerEmitter.emit(config.emitter.libp2p.newUser,jsonPayload)
          break;

        case "newMessage":
          listenerEmitter.emit(config.emitter.libp2p.newMessage,jsonPayload)
          break;

        case "userDisconnected":
          listenerEmitter.emit('userDisconnected',jsonPayload)
          break;

        default:
          logger.logData('error in switch statement- '+jsonPayload.type)
      }
  }



///Code for Socket.io. PORT IS 8080
//TODO: Shift to separate module later on

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const request = require('request');
//port is 8080
const port = config.socket.portListener;
var userList = [];
var userMapping = [];

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


io.on('connection', (socket)=>{
  console.log('new connection received');
  //when user sends a message through the socket.io


  socket.on('new_message', (data)=>{
    console.log('received from socket' + JSON.stringify(data));
    logger.logData(data);
    //FOR TESTING PURPOSE ONLY!!
    //socket.broadcast.emit('new_message', data)
    //var data = JSON.parse(data)
    var id = data.sendToSocketId
    console.log('send to '+id);

    io.to(id).emit('new_message', data)
    listenerEmitter.emit(config.emitter.socket.newMessage,data)

    //console.log(io);
  })//socket.on(new_message) closes


  socket.on('new_user', (data)=>{
    console.log(data);
    var data = JSON.parse(data)
    console.log('new user joined '+data.username);
    console.log(socket.id)
    //CURRENTLY REMOVED FOR TESTING THE BASIC FUNCTION TODO
    // socket.id = '/#'+data.username;
    // console.log(socket.id);

    if (isUsenameTaken(data)) {
      //reject
    }else {
      userMapping.push( {socketId: socket.id, username: data.username, port: config.socket.portListener} );
      console.log(userMapping);

      io.emit('new_user',userMapping);
      listenerEmitter.emit('new_user', userMapping)

      var userData = {socketId: socket.id, username: data.username, port: config.socket.portListener}

      request.post({url:'http://127.0.0.1:5555/newUser', json: userData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
      });
    }
  })


  socket.on('disconnect', ()=>{
    console.log('disconnect called '+socket.id);
    try {
      for (var i = 0; i < userMapping.length; i++) {
        if (userMapping[i].socketId == socket.id) {
            userMapping.splice(i,1)
            var userData = {"socketId":socket.id}
            request.post({url:'http://127.0.0.1:5555/deleteUser', json: userData}, function optionalCallback(err, httpResponse, body) {
              if (err) {
                return console.error('upload failed:', err);
              }
              console.log('Upload successful!  Server responded with:', body);
            });
            break
        }
      }
      console.log(userMapping);
    } catch (e) {
      console.log(e);
    } finally {
    }
  })

})

function isUsenameTaken(data) {
  for (var i = 0; i < userMapping.length; i++) {
    var user = userMapping[i]
    if (user.username == data.username) {
      console.log('duplicate user name!. Reject this');
      return true;
    }
  }
  return false
}

  listenerEmitter.on(config.emitter.libp2p.newMessage, (data)=>{
    //send message via socket to
    socket.emit('new_message',data)
  })
