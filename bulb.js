var spawn = require('child_process').spawn;
var _ = require('lodash');
var fs = require('fs');
var Q = require('q');

var isOffCommand = require('./iota.js').isOffCommand;

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
    online: false,
    lastCommand: 'nonzero' //Initial flag, might not be a good idea. Bad design
  };

  var connectorInterval;

  // Starting the process
  var gatttool = spawn('gatttool', [
    '-I',
    '-b',
    macId
  ]);
  gatttool.stdin.setEncoding('utf-8');

  // last command filename... yaay!
  var commandFilename = stateInfo.macId + '.command';

  // Creates or read the last command file...
  var createCache = ()=>{
    try{
      fs.statSync(commandFilename);
      console.log('Loading last command for ', stateInfo.macId);
      var readString = _.trim(fs.readFileSync(commandFilename).toString('utf-8'));
      stateInfo.lastCommand = (readString === '')?null:readString;
      if(stateInfo.lastCommand){
        console.log('Last command for', stateInfo.macId, 'is', stateInfo.lastCommand);
        applyLastCommand();
      }
    }
    catch(err){ // If it doesn't exist
      console.log(commandFilename, 'doesnt exist. Creating...', err);
      stateInfo.lastCommand = null;
      fs.writeFile(commandFilename, '', (err)=>{
        // This could be a performance bottlneck, not sure what to do.
        // Best would be to use someting like Redis or something
        if(err) {
          console.log("Failed to write last command...");
        }
      }); //Keeping that safe
    }
  }

  // Managing the incoming streams
  var incomingString = '';
  var incomingHandler = (chunk)=>{
    var theString = chunk.toString('utf-8');
    console.log(theString);
    incomingString += theString;
    if (incomingString.indexOf(connectSuccess) !== -1){
      connectionSuccess();
      incomingString = '';
    }
    else if(incomingString.indexOf(failure) !== -1){
      connectionFailed();
      incomingString = '';
    }
    else if(incomingString.indexOf(error) !== -1){
      connectionFailed();
      incomingString = '';
    }
    else if(incomingString.length > 10000){
      // Flushing
      // What are the chances that this will split up a legitimate response...
      // Shouln't be a huge problem because it's always polling
      incomingString = '';
    }
  };
  gatttool.stdout.on('data', incomingHandler);

  // Clear the connect thingie
  var connectionSuccess = ()=>{
    stateInfo.online = true;
    if(stateInfo.lastCommand === 'nonzero'){
      createCache();
    }
    else{
      applyLastCommand();
    }
  }

  // Restart the connection trials
  var connectionFailed = ()=>{
    stateInfo.online = false;
  }

  // Apply last known command upon in case it was turned off...
  // Assuming this is the only way to turn the bulb off...
  // TODO: Maybe this is not the best of ideas...
  var applyLastCommand = ()=>{
    // If only it's a turn-off command...
    if(isOffCommand(stateInfo.lastCommand)){
      writeToBulb(stateInfo.lastCommand);
    }
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
    stateInfo.lastCommand = colorValue;
    var writeString = gattWriteString(colorValue);
    write(writeString);
    fs.writeFile(commandFilename, colorValue); //Keeping that safe
  };

  var killDaemon = ()=>{
    // make sure you delete all the pollers, please!
    clearInterval(connectorInterval);

    // And then take of the process...
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
