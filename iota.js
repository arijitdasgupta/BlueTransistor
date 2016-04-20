const spawn = require('child_process').spawn;
const _     = require('lodash');

var gatttool = spawn('gatttool', [
  '-i',
  '-b',
  'F4:B8:5E:E3:D9:E9'
]);

var gattoolCommandsStream = gatttool.stdin;

// Primary connection
gattoolCommandsStream.st.write('connect');
gattoolCommandsStream.end();

const gattWriteString = (value)=>{
  return `char-write-cmd 0x002b ${value}`
};

const calculateChecksum = (hexString, salt)=>{
  const byteArray = _.map(_.chunk(hexString, 2), (i1, i2)=>{
    return parseInt(i1 + i2, 16);
  });
  const sum = _.reduce(byteArray, (a, b)=>{return a + b;}, 0);
  const saltedSum = sum + salt;
  const checksum = (saltedSum & 0xFF).toString(16);
  return checksum;
}

const calculateColorValue = (red, green, blue, alpha)=>{
  red = _.padLeft(red.toString(16), 2, '0');
  green = _.padLeft(green.toString(16), 2, '0');
  blue = _.padLeft(blue.toString(16), 2, '0');
  alpha = _.padLeft(alpha.toString(16), 2, '0');
  const hexString = `0f0d0300${red}${green}${blue}${alpha}000000000000`;
  const checksum = calculateChecksum(hexString);
  // Get the main string
  // Calculate checksum
  return `${hexString}${checksum}ffff`;
}

const calculateToggleValue = (red, green, blue, alpha)=>{
  return calculateValue;
};

const writeToBulb = (reg, green, blue, alpha)=>{
  const colorValue = calculateColorValue(red, greed, blue, alpha);
  const writeString = gattWriteString(colorValue);
  gatttool.stdin.write(writeString);
};

const turnBulb = (onOff)=>{

};
