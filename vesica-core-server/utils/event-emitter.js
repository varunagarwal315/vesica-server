const events = require('events');
const listeneremitter = new events.EventEmitter();
const dialeremitter = new events.EventEmitter();

module.exports = function(){
  return{
    listenerEmitter: listeneremitter
    , dialerEmitter: dialeremitter
  }
}
