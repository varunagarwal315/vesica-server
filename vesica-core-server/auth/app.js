'use strict';

const express = require('express');
const config = require('../config/app.json');
const users = require('./users.json');
const bodyParser = require('body-parser');
const app = express()
const userMap = []
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


app.listen(config.auth.port, () => {
  console.log('server on: ' + config.auth.port);
})


app.post('/login', (req,res)=>{
  let data = req.body
  console.log('asdads'+data);
  console.log('received login request '+JSON.stringify(data));
  if (authUser(data)) {
    let num = Math.floor(7 + Math.random() * 4)
    console.log(num);
    if (num % 2 == 0) {
      res.send({"status":"success", "portNumber":config.socket.portListener})
      res.end()
      console.log('port '+config.socket.portListener);
    }else {
      res.send({"status":"success", "portNumber":config.socket.portDialer})
      res.end()
      console.log('port '+config.socket.portDialer);
    }
  }else {
    res.send({"status":"fail"})
    res.end()
  }
})


function authUser(data){
  for(let obj in users.auth){
    console.log(users.auth[obj].password);
    if (users.auth[obj].password===data.password && users.auth[obj].username===data.username) {
      return true;
    }
  }
  return false;
}


app.post('/newUser', (req,res)=>{
  console.log('new user call received ');
  console.log(req.body);
  userMap.push({username: req.body.username
                // ,port: req.body.port
                ,socketId: req.body.socketId
                // ,publicKey: "AhMKmKJh8qAOPRY02LIJRBCpfS4czEdnfUhYV"
              })
  console.log(userMap);
  res.end()
})



app.post('/deleteUser', (req,res)=>{
  console.log('user deleted '+JSON.stringify(req.body));
  for (let i = 0; i < userMap.length; i++) {
    let name= userMap[i]
    if (name.socketId = req.body.socketId) {

      userMap.splice(i,1)
    }else {

    }
  }
})


app.get('/userList',(req,res)=>{
  console.log('request for user list received');
  console.log(userMap);
  res.send({"modelList":userMap})
  //res.send(userMap)
  res.end()
})
