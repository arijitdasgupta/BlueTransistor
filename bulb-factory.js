var Q =      require('q');
var _ =      require('lodash');
var Bulb =   require('./bulb.js');
var Logger = require('./logger.js');

var BulbFactory = {
  bulbTypes: {
    'iota': {
      // The name of the bulb that will be associated witht he config types
      name: 'iota',
      // The bluetoothctl name that comes up match
      regex: /Lite/,
      // The protocol class implementation
      protocolClass: require('./bulbtypes/iota.js')
    }
  },
  bulbMacs: [],
  registerBulb: function(newBulbMac){
    if(_.has(newBulbMac, 'macId') && _.has(newBulbMac, 'type')){
      var newBulbFactory = _.clone(this, true);
      newBulbFactory.bulbMacs.push(newBulbMac);
      return newBulbFactory;
    }
    else {
      throw 'Improper bulb data being registered';
    }
  },
  registerBulbType: function(newType){
    if(_.has(newType, 'name') && _.has(newType, 'regex') && _.has(newType, 'protocolClass')){
      var newBulbFactory = _.clone(this, true);
      newBulbFactory.bulbTypes[newType.name] = _.clone(newType);
      return newBulbFactory;
    }
    else {
      throw 'Improper bulb type being registered';
    }
  },
  init: function(){
    var deferred = Q.defer();
    if(this.bulbMacs.length !== 0){
      var bulbs = _.map(this.bulbMacs, (bulbMac)=>{
        return new Bulb(bulbMac.macId, this.bulbTypes[bulbMac.type].protocolClass);
      });
      deferred.resolve(bulbs);
    }
    else {
      // TODO: Do a scan w/ bleutoothctl and then resolve whatever and get all the bulbs
      deferred.resolve('No bulbs registered');
    }
    return deferred.promise;
  }
}

module.exports = BulbFactory;
