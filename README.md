BlueTransistor
=============================

Control your RGB Bluetooth LE bulbs from an webapp, or use as a node package. Currently iota Bulb (http://goiota.com/) is supported. More Bluetooth LE bulb support coming soon. Best works with Raspberry Pi (3 or with a Bluetooth dongle).

For protocol help on the iota Bulb, https://gist.github.com/arijitdasgupta/14f60d3189319ce707847a4f577291b8

Requirements:
 - Raspberry Pi 3 / Raspberry Pi 2 with BT LE dongle / Bluetooth enabled computers with BlueZ stack support.
 - BlueZ Bluetooth Stack http://www.bluez.org/
 - `node` preferably `>=5.2.0`, `npm` preferably `>=3.3.12` (Use https://github.com/creationix/nvm for easy nodeJS setup)

###To Start:

`config.json` holds the MAC id array of all the bulbs and their types that you want to connect. Before running, do copy `config.sample.json` to `config.json` & fill up the MAC IDs in `config.json`.

```
npm install
bower install
node app.js
```

The webapp runs on `PORT 7000`.

##To to use the HTTP REST API

###POST

`POST` to `/bulbs`,
```json
{
  "bulbs": [
    {
      "red": "<RED for Bulb 1>",
      "green": "<GREEN for Bulb 1>",
      "blue": "<BLUE for Bulb 1>",
      "alpha": "<ALPHA for Bulb 1>"
    },
    [
     {
       "red": "<RED for Bulb 2>",
       "green": "<GREEN for Bulb 2>",
       "blue": "<BLUE for Bulb 2>",
       "alpha": "<ALPHA for Bulb 2>"
     },
     {
       "red": "<RED for Bulb 2>",
       "green": "<GREEN for Bulb 2>",
       "blue": "<BLUE for Bulb 2>",
       "alpha": "<ALPHA for Bulb 2>"
     },
     {
       "red": "<RED for Bulb 2>",
       "green": "<GREEN for Bulb 2>",
       "blue": "<BLUE for Bulb 2>",
       "alpha": "<ALPHA for Bulb 2>"
     }
    ],
    "off",
    "stop",
    "unchanged"
  ]
}
```
Post an array to `/bulbs` endpoint with each entry on that array corresponding to the `bulbs` array in `config.json`.
 - If one entry is the array is an object it will be treated as a color command for that bulb. This will also stop cycling between colors mode.
 - If one entry is an array of color objects the bulb will start cycling through the colors.
 - `stop` will stop cycling between colors.
 - `off` will turn the corresponding bulb off.
 - `unchanged` won't change anything on that bulb.

###GET
`GET` to `/bulbs` will get you the status of the bulbs currently online...

###The webapp
You can go to `/` on your browser for a angular webapp doing which has an UI for the bulbs.

###The lib
You can use this repository as a node library package.

```javascript
BulbFactory = require('BlueTransistor');
BulbFactory.registerBulb({
  macId: '<MAC ID>',
  type: 'iota'
}).init().then(function(bulbs){
  bulbs[0].writeToBulb({
    red: 255,
    blue: 255,
    green: 255,
    alpha: 255
  });
  // Kills the GATTtool process as well
  bulbs[0].killDaemon();
});
```

###NOTE:
To properly kill the process kill the `node` instance with a SIGINT. It will terminal all the child processes as well.

###TODO:
 - Write a better color selector
 - Write a Yeelight bulb protocol class
 - Write auto-scan for bulbs
 - Write a kill script for the processes
 - Write a doc site for the library.
 - Write bot code with web-hooks
