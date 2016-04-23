var express =    require('express');
var _ =          require('lodash');
var bodyParser = require('body-parser');
var Q =          require('q');
var fs =         require('fs');

var iota =       require('./iota.js');
var Bulb =       require('./bulb.js');
var logger =     require('./logger.js');

const configFilename = 'config.json';

var config;
var loadConfig = ()=>{
  try{
    fs.statSync(configFilename);
    logger.writeLog('Loading config');
    var readString = _.trim(fs.readFileSync(configFilename).toString('utf-8'));
    config = JSON.parse(readString);
    init();
  }
  catch(err){ // If it doesn't exist
    logger.writeLog(err);
    logger.writeLog('Error loading config, exiting');
    process.exit(0);
  }
};

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
  bulbs = _.map(config.bulbs, (bulbMAC)=>{
    return new Bulb(bulbMAC);
  })
};

// Initiate the webapp
var initiateApp = ()=>{
  webapp = express();
  webapp.use(bodyParser.json());

  webapp.post('/bulbs', (req, res)=>{
    // Getting the data
    logger.writeLog(req.body);
    var newData = req.body;
    var commandPromises = _.map(newData.bulbs, (bulbData, index)=>{
      // If there is a legitimate object
      logger.writeLog(bulbData);
      if(!_.isString(bulbData) && _.isArray(bulbData)){
        logger.writeLog('Starting to rotate colors on', bulbs[index].stateInfo.macId);
        var deferred = Q.defer();
        bulbs[index].rotateCommandsRandomly(_.map(bulbData,iota.colorValue));
        deferred.resolve('ROTATING');
        return deferred.promise;
      }
      else if(!_.isString(bulbData) && _.isObject(bulbData)){
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
      res.json(response);
      res.end();
    });
  });

  webapp.get('/bulbs', (req, res)=>{
    // Gets the status of the bulbs
    res.json(_.map(bulbs, (bulb)=>{
      return bulb.stateInfo;
    }));
    res.end();
  });

  webapp.use('/', express.static('public'));
  webapp.use('/bower_components', express.static('bower_components'));

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
  loadConfig();
  // init();
}
