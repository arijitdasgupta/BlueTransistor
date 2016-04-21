var iota = require('./iota.js');
var Bulb = require('./bulb.js');

var newBulb = new Bulb('F4:B8:5E:E3:D9:E9');
setTimeout(function(){
  newBulb.writeToBulb(iota.colorValue(255,0,255,200));
  newBulb.killDaemon();
}, 1000);
