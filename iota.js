var _     = require('lodash');

var calculateChecksum = function(hexString, salt){
  var byteArray = _.map(_.chunk(hexString, 2), (i)=>{
    return parseInt(i[0] + i[1], 16);
  });
  var sum = _.reduce(byteArray, function(a, b){return a + b;}, 0);
  var saltedSum = sum + salt;
  var checksum = _.padStart((saltedSum & 0xFF).toString(16), 2, '0');
  return checksum;
}

var calculateColorValue = function(color){
  var red = _.padStart(color.red.toString(16), 2, '0');
  var green = _.padStart(color.green.toString(16), 2, '0');
  var blue = _.padStart(color.blue.toString(16), 2, '0');
  var alpha = _.padStart(color.alpha.toString(16), 2, '0');
  var hexString = '0f0d0300' + red + green + blue + alpha + '000000000000';
  var checksum = calculateChecksum(hexString, 0xE5);
  // Get the main string
  // Calculate checksum
  return hexString + checksum + 'ffff\n';
}

var calculateToggleValue = function(red, green, blue, alpha){
  return calculateValue;
};

// 0f0a0d00
// +
// NEXT COLOR HEX
// (ffffff) (RRGGBB 3 byte)
// +
// (c8050000|00050000) (4 bytes)
// +
// CHECKSUM (1 byte)
// +
// ffff

var calculateOnOff = function(on){
  var hexString = '0f0a0d00';
  if(!on){
    hexString += '00000000050000';
  }
  else {
    var red = _.padStart(on.red.toString(16), 2, '0');
    var green = _.padStart(on.green.toString(16), 2, '0');
    var blue = _.padStart(on.blue.toString(16), 2, '0');
    var alpha = _.padStart(on.alpha.toString(16), 2, '0');
    hexString += red + green + blue + alpha + '050000';
  }
  var checksum = calculateChecksum(hexString, 0xE8);
  return hexString + checksum + 'ffff\n';
};

var isOffCommand = function(command){
  return command === '0f0a0d000000000005000013ffff';
};

module.exports = {
  isOffCommand: isOffCommand,
  colorValue: calculateColorValue,
  toggle: calculateOnOff
};
