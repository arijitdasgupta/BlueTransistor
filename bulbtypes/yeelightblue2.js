var _     = require('lodash');
var helpers = require('../helpers.js');

const controlHandle = '0x0012';

const calculateColorValue = function(color){
  var red = _.padStart(helpers.gate(color.red,255,0), 3, '0');
  var green = _.padStart(helpers.gate(color.green,255,0), 3, '0');
  var blue = _.padStart(helpers.gate(color.blue,255,0), 3, '0');
  var alpha = _.padStart(helpers.gate(color.alpha,100,0), 3, '0');
  var string = _.padEnd(red + ',' + green + ',' + blue + ',' + alpha, 18, ',');
  return (new Buffer(string)).toString('hex');
};

const calculateOnOff = function(on){
  var onColor = {red:255,blue:255,green:255,alpha:255};
  var offColor = {red:0,blue:0,green:0,alpha:0};
  return on?calculateColorValue(onColor):calculateColorValue(offColor);
};

var isOffCommand = function(rawCommand){
  return _.trim(rawCommand) === calculateOnOff(false);
};

module.exports = {
  colorValue: calculateColorValue,
  toggle: calculateOnOff,
  controlHandle: controlHandle,
  returnsNotification: false
};
