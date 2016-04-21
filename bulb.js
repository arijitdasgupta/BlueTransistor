var spawn = require('child_process').spawn;

var gattWriteString = function(value){
  return 'char-write-cmd 0x002b ' + value + '\n';
};

var startDaemon = function(macId){
  var gatttool = spawn('gatttool', [
    '-I',
    '-b',
    macId
  ]);

  // Primary connection
  gatttool.stdin.setEncoding('utf-8');
  gatttool.stdin.write('connect\n');
  // TODO: Make error checking
  //
  gatttool.stdout.pipe(process.stdout);
  return gatttool;
};

var writeToBulb = function(colorValue, gatttool){
  var writeString = gattWriteString(colorValue);
  console.log('Writing...', writeString);
  gatttool.stdin.write(writeString);
  // TODO: Return success-failure stream
};

var killDaemon = function(gatttool){
  gatttool.stdin.write('disconnect\n');
  gatttool.stdin.write('exit\n');
  gatttool.stdin.end();
  gatttool.kill('SIGTERM');
};

var init = function(macId){
  var gatttool = startDaemon(macId);

  return {
    writeToBulb: function(colorValue){
      writeToBulb(colorValue, gatttool);
    },
    killDaemon: function(){
      killDaemon(gatttool);
    }
  }
}

module.exports = init;
