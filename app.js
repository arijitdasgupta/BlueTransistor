var express =    require('express');
var _ =          require('lodash');
var bodyParser = require('body-parser')

var iota =       require('./iota.js');
var Bulb =       require('./bulb.js');
var config =     require('./config.js');

// The stateful components
var webapp, bulbs;

var initiateBulbs = ()=>{
  bulbs = _.map(config.bulbMACs, (bulbMAC)=>{
    return new Bulb(bulbMAC);
  })
}

var initiateApp = ()=>{
  webapp = express();
  webapp.use(bodyParser.json());

  webapp.post('/', function(req, res){
    // Getting the data
    console.log(req.body);
    var newData = req.body;
    var data = _.assign({
      bulbs: 1,
      red: 255,
      green: 255,
      blue: 255,
      alpha: 200
    }, newData);
    // Putting the data in
    var theBulb = bulbs[data.bulb - 1];
    theBulb.writeToBulb(iota.colorValue(
      data.red,
      data.green,
      data.blue,
      data.alpha
    ));
    res.write('DONE');
    res.end();
  });

  webapp.listen(7000, ()=>{
    console.log('Wedapp listening on 7000');
  });
}

var initiateEvents = ()=>{
  var killer = ()=> {
    console.log('About to exit, terminating all the daemons');
    _.forEach(bulbs, function(bulb){
      bulb.killDaemon();
    });
    process.exit(0);
  }
  process.on('SIGINT', killer);
  process.on('SIGTERM', killer);

};

// Main entry point
var init = ()=>{
  initiateBulbs();
  initiateApp();
  initiateEvents();
}

// If it's the main, start-it up!
if(!module.parent){
  init();
}
