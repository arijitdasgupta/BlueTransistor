var spawn =  require('child_process').spawn;
var _ =      require('lodash');
var fs =     require('fs');
var Q =      require('q');

var logger = require('./logger.js');

const connectSuccess = 'Connection successful';
const acknowledgement = 'Notification handle';
const error = 'Error';
const failure = 'Command Failed';

const STATE_STATIC = 'STATIC';
const STATE_ROTATING = 'ROTATING';
const STATE_OFF = 'OFF';

const RESPONSE_STOPPED = 'STOPPED';

// Will me assigned over the incoming bulb data
const defaultColorValue = {
  "red": 255,
  "green": 255,
  "blue": 255,
  "alpha": 200
};

const init = function(macId, bulbProtocol){
  // Status stuff
  var stateInfo = {
    macId: macId,
    online: false,
    lastCommand: undefined, //Initial flag, might not be a good idea. Bad design
    mode: 'off'
  };

  const bulbProtocol = bulbProtocol;

  var connectorInterval;
  var colorRotateInterval;

  // Last command filename... yaay!
  var commandFilename = stateInfo.macId + '.command';
  var commandSuccessCallback = null;

  // Creates or read the last command file...
  var createCache = ()=>{
    try{
      fs.statSync(commandFilename);
      logger.writeLog('Loading last command for ', stateInfo.macId);
      stateInfo.lastCommand = readLastCommand();
      logger.writeLog('Last command for', stateInfo.macId, 'is', stateInfo.lastCommand);
      applyLastCommand();
    }
    catch(err){ // If it doesn't exist or JSON parse fails it resets
      logger.writeLog(commandFilename, 'doesnt exist. Creating...', err);
      stateInfo.lastCommand = null;
      fs.writeFile(commandFilename, stateInfo.lastCommand, (err)=>{
        // Best would be to use someting like Redis (overkill!)
        if(err) {
          logger.writeLog("Failed to write last command...");
        }
      });
    }
  };

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
  };

  var setCommandHandler = (callback)=>{
    commandSuccessCallback = callback;
  };

  var clearCommandHandler = ()=>{
    commandSuccessCallback = null;
  };

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

  var readLastCommand = ()=>{
    var readString = (fs.readFileSync(commandFilename).toString('utf-8'));
    var readStuff;
    try {
      readStuff = JSON.parse(readString);
    }
    catch(err){
      readStuff = _.trim(readString);
    }
    return readStuff;
  };

  var writeLastCommand = (object)=>{
    if(_.isString(object)){
      fs.writeFile(commandFilename, object);
    }
    else {
      fs.writeFile(commandFilename, JSON.stringify(object));
    }
  };

  // Apply last known command...
  var applyLastCommand = ()=>{
    // If only it's a turn-off command...
    logger.writeLog('Applying last command', stateInfo.lastCommand);
    writeToBulb(stateInfo.lastCommand, true);
  };

  var pushToBulb = (colorData, internalCall)=>{
    // Setting the last state values
    var colorValue = _.assign(_.clone(defaultColorValue), colorData);

    var writeString = bulbProtocol.gattWriteString(colorValue);
    logger.writeLog('Writing...', writeString);
    gatttool.stdin.write(writeString);
  };

  // Toggles between random color rotating
  var rotateCommandsRandomly = (array)=>{
    if(colorRotateInterval){
      clearInterval(colorRotateInterval);
      colorRotateInterval = null;
    }
    colorRotateInterval = setInterval(new function(){
      var arrayClosured = array;
      return function(){
        var index = Math.floor(Math.random() * arrayClosured.length);
        var newCommand = arrayClosured[index];
        pushToBulb(newCommand);
      }
    }, 1500);
  };

  var setCommandResolver(deferred)=>{
    var commandTimer;
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
  };

  var resetAllCommandIntervals = ()=>{
    // If at all it's rotating stop that before turning it off
    if(colorRotateInterval){
      clearInterval(colorRotateInterval);
      colorRotateInterval = null;
    }
  };

  var writeToBulb = (bulbData)=>{
    var deferred = Q.defer();
    stateInfo.lastCommand = bulbData;
    writeLastCommand(bulbData);
    if(!_.isString(bulbData) && _.isArray(bulbData)){
      stateInfo.mode = STATE_ROTATING;
      logger.writeLog('Starting to rotate colors on', bulbs[index].stateInfo.macId);
      var reformedBulbData = _.map(bulbData, (oneBulb)=>{
        return _.assign(_.clone(defaultColorValue), oneBulb);
      });
      rotateCommandsRandomly(_.map(reformedBulbData, bulbProtocol.colorValue));
      deferred.resolve(stateInfo);
      return deferred.promise;
    }
    else if(!_.isString(bulbData) && _.isObject(bulbData)){
      stateInfo.mode = STATE_STATIC;
      resetAllCommandIntervals();
      pushToBulb(bulbProtocol.colorValue(colorData));
      setCommandResolver(deferred);
    }
    // Stop rotation
    else if(bulbData === 'stop'){
      stateInfo.mode = STATE_STATIC;
      resetAllCommandIntervals();
      deferred.resolve(RESPONSE_STOPPED);
    }
    else if(bulbData === 'off'){
      stateInfo.mode = STATE_OFF;
      pushToBulb(bulbProtocol.toggle(false));
      resetAllCommandIntervals();
      setCommandResolver(deferred);
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
