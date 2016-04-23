var express =    require('express');
var _ =          require('lodash');
var bodyParser = require('body-parser');
var Q =          require('q');

var iota =       require('./iota.js');
var Bulb =       require('./bulb.js');
var config =     require('./config.js');
var logger =     require('./logger.js');

// Will me assigned over the incoming bulb data
const defaultColorValue = {
  red: 255,
  green: 255,
  blue: 255,
  alpha: 200
};

// The stateful components
var webapp, bulbs;

var initiateBulbs = ()=>{
  bulbs = _.map(config.bulbMACs, (bulbMAC)=>{
    return new Bulb(bulbMAC);
  })
}

// Initiate the webapp
var initiateApp = ()=>{
  webapp = express();
  webapp.use(bodyParser.json());

  webapp.post('/', function(req, res){
    // Getting the data
    var resObj = res;
    logger.writeLog(req.body);
    var newData = req.body;
    var commandPromises = _.map(newData.bulbs, (bulbData, index)=>{
      // If there is a legitimate object
      if(!_.isString(bulbData) && _.isObject(bulbData)){
        var colorData = _.assign(defaultColorValue, bulbData);
        return bulbs[index].writeToBulb(iota.colorValue(colorData));
      }
      // Of just turn if off
      else if(bulbData === "off"){
        return bulbs[index].writeToBulb(iota.toggle(false));
      }
    });
    Q.all(commandPromises).then((response)=>{
      logger.writeLog('All response done!', response);
      res.write(response);
      res.end();
    });
  });

  webapp.listen(7000, ()=>{
    logger.writeLog('Webapp listening on 7000');
  });
}

var initiateEventHandlers = ()=>{
  // Making sure things get properly terminated when disconnected
  var killer = ()=> {
    _.forEach(bulbs, (bulb)=>{
      logger.writeLog('Terminating daemon for', bulb.stateInfo.macId);
      bulb.killDaemon();
    });
    process.exit(0);
  };

  process.on('SIGINT', killer);
  process.on('SIGTERM', killer);
}

// Main entry point
var init = ()=>{
  initiateBulbs();
  initiateEventHandlers();
  initiateApp();
}

// If it's the main, start-it up!
if(!module.parent){
  init();
}
