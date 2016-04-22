function writeLog(){
  var args = Array.prototype.slice.call(arguments);
  args.unshift((new Date()).toString());
  console.log.apply({}, args);
};

module.exports = {
  writeLog: writeLog
};
