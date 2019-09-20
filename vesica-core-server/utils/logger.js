'use strict'

var moment = require('moment');
 module.exports = function(){
   return {
     logData:function(data) {
       console.log(moment().format("HH:mm:ss")+ ' '+ data)
     }
   }
 }
