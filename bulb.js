var spawn = require('child_process').spawn;
var _ = require('lodash');
var Q = require('q');

const gattWriteString = function(value){
  return 'char-write-cmd 0x002b ' + value + '\n';
};

const connectSuccess = 'Connection successful';
const acknowledgement = 'Notification handle';
const error = 'Error';
const failure = 'Command Failed';

const init = function(macId){
  // Status stuff
  var stateInfo = {
    macId: macId,
    online: false
  };

  var connectorInterval;

  // Starting the process
  var gatttool = spawn('gatttool', [
    '-I',
    '-b',
    macId
  ]);

  gatttool.stdin.setEncoding('utf-8');

  // Managing the incoming streams
  var incomingString = '';
  var incomingHandler = (chunk)=>{
    var theString = chunk.toString('utf-8');
    console.log(theString);
    incomingString += theString;
    if (incomingString.indexOf(connectSuccess) !== -1){
      clearConnector();
      incomingString = '';
    }
    else if(incomingString.indexOf(failure) !== -1){
      reinitConnector();
      incomingString = '';
    }
    else if(incomingString.indexOf(error) !== -1){
      reinitConnector();
      incomingString = '';
    }
    else if(incomingString.length > 10000){
      // Flushing
      // What are the chances that this will split up a legitimate response...
      incomingString = '';
    }
  };
  gatttool.stdout.on('data', incomingHandler);

  // Clear the connect thingie
  var clearConnector = ()=>{
    stateInfo.online = true;
    clearInterval(connectorInterval);
  }

  // Restart the connection trials
  var reinitConnector = ()=>{
    stateInfo.online = false;
    connect();
  }

  // Primary connection
  // This is dangerous, but with great power comes great responsibility...
  var connect = function(){
    connectorInterval = setInterval(()=>{
      console.log('Attempting to connect to', stateInfo.macId);
      gatttool.stdin.write('connect\n');
    }, 2000);
  };

  var write = (writeString)=>{
    console.log('Writing...', writeString);
    gatttool.stdin.write(writeString);
  }

  var writeToBulb = (colorValue)=>{
    var writeString = gattWriteString(colorValue);
    write(writeString);
  };

  var killDaemon = ()=>{
    gatttool.stdin.write('disconnect\n');
    gatttool.stdin.write('exit\n');
    gatttool.stdin.end();
    gatttool.kill('SIGTERM');
  };

  connect();

  return {
    stateInfo: stateInfo,
    writeToBulb: writeToBulb,
    killDaemon: killDaemon
  };
};

module.exports = init;
