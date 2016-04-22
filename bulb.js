var spawn = require('child_process').spawn;
var Promise = require('promise');

const gattWriteString = function(value){
  return 'char-write-cmd 0x002b ' + value + '\n';
};

const init = function(macId){
  // Status stuff ready
  var stateInfo = {
    macId: macId
  };

  // Starting
  var gatttool = spawn('gatttool', [
    '-I',
    '-b',
    macId
  ]);

  gatttool.stdin.setEncoding('utf-8');
  gatttool.stdout.on('data', (chunk)=>{
    console.log("Hellow!");
    console.log(chunk.toString('utf-8'));
  });

  var connect = function(){
    // Primary connection
    gatttool.stdin.write('connect\n');
  };

  var writeToBulb = (colorValue)=>{
    var writeString = gattWriteString(colorValue);
    console.log('Writing...', writeString);
    gatttool.stdin.write(writeString);
    // TODO: Return success-failure stream
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
