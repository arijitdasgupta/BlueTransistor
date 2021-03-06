BlueTransistor
=============================

Control your RGB Bluetooth LE bulbs from a web UI, or use as a node package.

Bluetooth bulbs supported
-------------------------
 1. iota Lite (http://goiota.com/)
 2. Yeelight Blue 2 (http://www.yeelight.co.uk/yeelight-blue-ii-bulb/). Has a fake `SUCCESS` response as of now.
 3. More bulb support coming soon...

For protocol help on the iota Bulb, https://gist.github.com/arijitdasgupta/14f60d3189319ce707847a4f577291b8

Requirements:
 - Raspberry Pi 3 / Raspberry Pi 2 with BT LE dongle / Bluetooth LE enabled computer with BlueZ stack support.
 - BlueZ Bluetooth Stack http://www.bluez.org/ (Compile and install)
 - `node` preferably `>=5.2.0`, `npm` preferably `>=3.3.12` (Use https://github.com/creationix/nvm for easy nodeJS setup)

###To Start:

`config.json` holds the MAC id array of all the bulbs and their types that you want to connect. Before running, do copy `config.sample.json` to `config.json` & fill up the MAC IDs in `config.json`.

```bash
npm install
bower install
node app.js
```

OR,

```bash
./run.sh
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
    "flow",
    "off",
    "stop",
    "unchanged"
  ]
}
```
Post an array to `/bulbs` endpoint with each entry on that array corresponding to the `bulbs` array in `config.json`.
 - If one entry in the array is a color object it will be treated as a color command for that bulb.
 - If one entry in the array is also an array of color objects the bulb will start cycling through the colors objects.
 - `stop` will stop any running color changes.
 - `flow` will make the corresponding bulb smoothly change to random colors.
 - `disco` will make the bulb go crazy at an interval speficied for that bulb make.
 - `off` will turn the corresponding bulb off.
 - `unchanged` or any other string won't change anything on that bulb.

###GET
`GET` to `/bulbs` will get you the status of the bulbs currently online...

###The webapp
You can go to `/` on your browser for a angular webapp doing which has an UI for the bulbs.

###The lib
You can use this repository as a node library package.

```bash
npm install blue-transistor
```

```javascript
BlueTransistor = require('blue-transistor');
BlueTransistor.registerBulb({
  macId: '<MAC ID>',
  type: 'iota'
}).init().then(function(bulbs){
  bulbs[0].writeToBulb({
    red: 255,
    blue: 255,
    green: 255,
    alpha: 255
  }).then(function(resp){
    console.log(resp);

    // Status of the bulb
    console.log(bulbs[0].stateInfo);

    // Kill the GATTtool process
    bulbs[0].killDaemon();
  });
});
```

###NOTES:
 - While running the app or when used as a library it will keep polling the Bluetooth bulb and maintain it's connection status. So other Bluetooth host can't connect to the same bulbs as long as the object instances (or the application) are alive.
 - When using as a library, at initiation of the module, the last applied command will be dispatched. Also if the bulb goes offline for some reason and comes back online it will dispatch the last command that it stores in the filesystem.
 - To properly kill the app kill the `node` process with a SIGINT. It will terminate all the child processes as well (e.g. GATTtool).

###TODO:
 - Write a better color selector in the UI.
 - Write auto-scan for bulbs.
 - Write a kill script for the processes.
 - Write a doc site for the library.
