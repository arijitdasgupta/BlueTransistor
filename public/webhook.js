var express =    require('express');
var _ =          require('lodash');
var bodyParser = require('body-parser');

var logger =     require('./logger.js');

var webhook = express();
webhook.use(bodyParser.json());

webhook.post('/', (req, res)=>{
  logger.writeLog(req.body);
  var newData = req.body;

  res.write('OK');
  res.end();
});

webhook.listen(8000, ()=>{
  logger.writeLog('Webhook listening on 8000');
});
