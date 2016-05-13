const _ =       require('lodash');
const helpers = require('./helpers.js');

/**
 * Only changes the color values, not the alpha value
 */
const nextColor = function(oldColor, newColor, increment){
  var midColor = {};
  _.forEach(oldColor, (value, key)=>{
    if(key !== 'alpha'){
      var val;
      if(value > newColor[key]){
        val = helpers.gate(value - increment, 255, newColor[key]);
      }
      else {
        val = helpers.gate(value + increment, newColor[key], 0);
      }
      midColor[key] = val;
    }
    else {
      midColor[key] = value;
    }
  });
  return midColor;
};

const newColor = function(){
  return {
    red: Math.floor(Math.random() * 255),
    green: Math.floor(Math.random() * 255),
    blue: Math.floor(Math.random() * 255),
    alpha: 255
  };
};

module.exports = {
  newColor: newColor,
  nextColor: nextColor
}
