function writeLog(){
  if(GLOBAL.blue_transistor_app_run_flag){
    var args = Array.prototype.slice.call(arguments);
    args.unshift((new Date()).toString());
    console.log.apply({}, args);
  }
};

module.exports = {
  writeLog: writeLog
};
