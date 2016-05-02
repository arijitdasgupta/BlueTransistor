const gate = function(value, maxValue, minValue){
  return (value > maxValue)?maxValue:((value < minValue)?minValue:value);
};

module.exports = {
  gate: gate
}
