var spawn = require('child_process').spawn;
var _     = require('lodash');

var gatttool = spawn('gatttool', [
  '-i',
  '-b',
  'F4:B8:5E:E3:D9:E9'
]);

var gattoolCommandsStream = gatttool.stdin;

// Primary connection
gattoolCommandsStream.st.write('connect');
gattoolCommandsStream.end();

var gattWriteString = function(value){
  return 'char-write-cmd 0x002b ' + value;
};

var calculateChecksum = function(hexString, salt){
  var byteArray = _.map(_.chunk(hexString, 2), (i1, i2)=>{
    return parseInt(i1 + i2, 16);
  });
  var sum = _.reduce(byteArray, (a, b)=>{return a + b;}, 0);
  var saltedSum = sum + salt;
  var checksum = _.padLeft((saltedSum & 0xFF).toString(16), 2, '0');
  return checksum;
}

var calculateColorValue = function(red, green, blue, alpha){
  red = _.padLeft(red.toString(16), 2, '0');
  green = _.padLeft(green.toString(16), 2, '0');
  blue = _.padLeft(blue.toString(16), 2, '0');
  alpha = _.padLeft(alpha.toString(16), 2, '0');
  var hexString = '0f0d0300' + red + green + blue + alpha + '000000000000';
  var checksum = calculateChecksum(hexString);
  // Get the main string
  // Calculate checksum
  return hexString + checksum + 'ffff';
}

var calculateToggleValue = function(red, green, blue, alpha){
  return calculateValue;
};

var writeToBulb = function(reg, green, blue, alpha){
  var colorValue = calculateColorValue(red, greed, blue, alpha);
  var writeString = gattWriteString(colorValue);
  console.log('Writing...', writeString);
  gatttool.stdin.write(writeString);
};

var turnBulb = function(onOff){

};

module.exports = {
  writeToBulb: writeToBulb
};
