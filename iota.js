var spawn = require('child_process').spawn;
var _     = require('lodash');

//var gatttool = spawn('gatttool', [
  //'-i',
  //'-b',
  //'F4:B8:5E:E3:D9:E9'
//]);

//var gattoolCommandsStream = gatttool.stdin;

// Primary connection
//gatttool.stdin.write('connect\n');
//gatttool.stdin.end();

var gattWriteString = function(value){
  return 'char-write-cmd 0x002b ' + value;
};

var calculateChecksum = function(hexString, salt){
  var byteArray = _.map(_.chunk(hexString, 2), (i)=>{
    return parseInt(i[0] + i[1], 16);
  });
  var sum = _.reduce(byteArray, function(a, b){return a + b;}, 0);
  var saltedSum = sum + salt;
  var checksum = _.padStart((saltedSum & 0xFF).toString(16), 2, '0');
  return checksum;
}

var calculateColorValue = function(red, green, blue, alpha){
  red = _.padStart(red.toString(16), 2, '0');
  green = _.padStart(green.toString(16), 2, '0');
  blue = _.padStart(blue.toString(16), 2, '0');
  alpha = _.padStart(alpha.toString(16), 2, '0');
  var hexString = '0f0d0300' + red + green + blue + alpha + '000000000000';
  var checksum = calculateChecksum(hexString, 0xE5);
  // Get the main string
  // Calculate checksum
  return hexString + checksum + 'ffff\n';
}

var calculateToggleValue = function(red, green, blue, alpha){
  return calculateValue;
};

var writeToBulb = function(red, green, blue, alpha){
  var colorValue = calculateColorValue(red, green, blue, alpha);
  var writeString = gattWriteString(colorValue);
  console.log('Writing...', writeString);
  //gatttool.stdin.write(writeString);
    //gatttool.stdin.end();
    spawn('./write_data.sh',[
	'F4:B8:5E:E3:D9:E9',
	colorValue]);
};

var turnBulb = function(onOff){

};

module.exports = {
  writeToBulb: writeToBulb
};
