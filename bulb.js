var spawn =  require('child_process').spawn;
var _ =      require('lodash');
var fs =     require('fs');
var Q =      require('q');
var logger = require('./logger.js');
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
  var commandSuccessCallback = null;

  // Creates or read the last command file...
  var createCache = ()=>{
    try{
      fs.statSync(commandFilename);
      logger.writeLog('Loading last command for ', stateInfo.macId);
      var readString = _.trim(fs.readFileSync(commandFilename).toString('utf-8'));
      stateInfo.lastCommand = (readString === '')?null:readString;
      if(stateInfo.lastCommand){
        logger.writeLog('Last command for', stateInfo.macId, 'is', stateInfo.lastCommand);
        applyLastCommand();
      }
    }
    catch(err){ // If it doesn't exist
      logger.writeLog(commandFilename, 'doesnt exist. Creating...', err);
      stateInfo.lastCommand = null;
      fs.writeFile(commandFilename, '', (err)=>{
        // This could be a performance bottlneck, not sure what to do.
        // Best would be to use someting like Redis or something
        if(err) {
          logger.writeLog("Failed to write last command...");
        }
      }); //Keeping that safe
    }
  }

  // Managing the incoming streams
  var incomingString = '';
  var incomingHandler = (chunk)=>{
    var theString = chunk.toString('utf-8');
    // logger.writeLog(theString);
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
    else if(incomingString.indexOf(acknowledgement) !== -1){
      commandSuccess();
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
    logger.writeLog(stateInfo.macId, 'is back online');
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
    logger.writeLog(stateInfo.macId, 'just went offline');
    stateInfo.online = false;
  }

  // Gets called when command is successful
  var commandSuccess = ()=>{
    if(commandSuccessCallback){
      commandSuccessCallback();
    }
  }

  var setCommandHandler = (callback)=>{
    commandSuccessCallback = callback;
  }

  var clearCommandHandler = ()=>{
    commandSuccessCallback = null;
  }

  // Apply last known command upon in case it was turned off...
  // Assuming this is the only way to turn the bulb off...
  var applyLastCommand = ()=>{
    // If only it's a turn-off command...
    logger.writeLog('Applying last command', stateInfo.lastCommand);
    // TODO: Not sure why I did this...
    var lastCmd = _.trim(stateInfo.lastCommand);
    // Because the bulb will always turn on with the last color,
    // So it doesn't matter
    // Only it was off, we want to turn off...
    if(isOffCommand(lastCmd)){
      writeToBulb(lastCmd);
    }
  }

  // Primary connection
  // This is dangerous, but with great power comes great responsibility...
  var connect = function(){
    connectorInterval = setInterval(()=>{
      if(stateInfo.online){
        logger.writeLog('Polling to ', stateInfo.macId);
      }
      else{
        logger.writeLog('Attempting to connect to', stateInfo.macId);
      }
      gatttool.stdin.write('connect\n');
    }, 2000);
  };

  var write = (writeString)=>{
    logger.writeLog('Writing...', writeString);
    gatttool.stdin.write(writeString);
  }

  var writeToBulb = (colorValue)=>{
    var deferred = Q.defer();
    var commandTimer;
    stateInfo.lastCommand = colorValue;
    var writeString = gattWriteString(colorValue);
    write(writeString);
    fs.writeFile(commandFilename, colorValue); //Keeping that safe
    if(stateInfo.online){
      setCommandHandler(()=>{
        clearTimeout(commandTimer);
        clearCommandHandler();
        deferred.resolve(stateInfo);
      });
      commandTimer = setTimeout(()=>{
        clearCommandHandler();
        deferred.resolve('failed');
      }, 10000);
    }
    else {
      deferred.resolve('offline');
    }
    return deferred.promise;
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
