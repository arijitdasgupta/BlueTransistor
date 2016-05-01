var express =    require('express');
var _ =          require('lodash');
var bodyParser = require('body-parser');
var Q =          require('q');
var fs =         require('fs');

var BulbFactory = require('./bulb-factory.js');
var logger =      require('./logger.js');

const configFilename = 'config.json';

// The stateful components
var webapp, bulbs, config;

// This is the entry point to the application
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

var initiateBulbs = ()=>{
  var deferred = Q.defer();
  _.reduce(config.bulbs, (Factory, bulb)=>{
    return Factory.registerBulb(bulb);
  }, BulbFactory)
  .init()
  .then((newBulbs)=>{
    bulbs = newBulbs;
    deferred.resolve(true);
  });
  return deferred.promise;
};

var initiateApp = ()=>{
  webapp = express();
  webapp.use(bodyParser.json());

  webapp.post('/bulbs', (req, res)=>{
    logger.writeLog(req.body);
    var newData = req.body.bulbs;
    var commandPromises = _.map(bulbs, (bulb, index)=>{
      var oneBulb = newData[index];
      if (_.isString(oneBulb) || _.isArray(oneBulb) || _.isObject(oneBulb)) {
        return bulb.writeToBulb(oneBulb);
      }
      else {
        var deferred = Q.defer();
        deferred.resolve('ERROR ON BULB COMMAND');
        return deferred.promise;
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
};

// Making sure things get properly terminated when the app is SIGTERM or SIGINTed
var initiateEventHandlers = ()=>{
  var deferred = Q.defer();
  deferred.resolve(true);
  var killer = ()=> {
    _.forEach(bulbs, (bulb)=>{
      logger.writeLog('Terminating daemon for', bulb.stateInfo.macId);
      bulb.killDaemon();
    });
    process.exit(0);
  };

  process.on('SIGINT', killer);
  process.on('SIGTERM', killer);

  return deferred.promise;
}

// Main entry point
var init = ()=>{
  initiateBulbs()
  .then(initiateEventHandlers)
  .then(initiateApp);
}

// If it's the main, start-it up or can be used as a module!
if(!module.parent){
  loadConfig();
}
else {
  module.exports = BulbFactory;
}
