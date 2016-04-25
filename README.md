iota Lite Deamon
================

Enables you programmatically control the iota Lite (http://goiota.com/) without the official mobile application. This is a very incomplete placeholder project as on now. Best works with Raspberry Pi. (3 would be the best)

For protocol help, https://gist.github.com/arijitdasgupta/14f60d3189319ce707847a4f577291b8 which is also incomplete.

Requirements:
 - A Bluetooth LE enabled adapter or Raspberry Pi 3or any bluetooth interfaced computer should work.
 - Running Linux
 - GATTtool http://www.bluez.org/
 - `node` preferably `>=5.2.0`, `npm` preferably `>=3.3.12` (Use https://github.com/creationix/nvm for easy nodeJS setup)

To Start:
```
npm install
bower install
node app.js
```

`config.json` holds the MAC id array of all the bulbs that you want to connect.

Before running, do copy and fill up the MAC IDs from `config.sample.json`.

The webapp runs on `PORT 7000`.
###POST

`POST` to `/bulbs`,
```
{
  "bulbs": [
    {
      red: <RED for Bulb 1>,
      green: <GREEN for Bulb 1>,
      blue: <BLUE for Bulb 1>,
      alpha: <ALPHA for Bulb 1>
    },
    [{
      red: <RED for Bulb 1>,
      green: <GREEN for Bulb 1>,
      blue: <BLUE for Bulb 1>,
      alpha: <ALPHA for Bulb 1>
    },
    {
      red: <RED for Bulb 1>,
      green: <GREEN for Bulb 1>,
      blue: <BLUE for Bulb 1>,
      alpha: <ALPHA for Bulb 1>
    },
    {
      red: <RED for Bulb 1>,
      green: <GREEN for Bulb 1>,
      blue: <BLUE for Bulb 1>,
      alpha: <ALPHA for Bulb 1>
    }
    ],
    "off"
  ]
}
```

"off" will turn the corresponding bulb off. if u want to keep it unchanged, just put some other string, like "unchanged".

An array of color objects will make the colors rotate randomly. Same command will turn if off.

###GET
`GET` to `/bulbs` will get you the status of the bulbs currently online...

Also you can go to `/` for a webpage doing the same thing

TODO:
 - Write a better color palette
 - Write a better kill script for the process
 - Write bot code with web-hooks
