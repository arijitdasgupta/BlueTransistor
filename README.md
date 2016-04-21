iota Lite Deamon
================

Enables you programmatically control the iota Lite (http://goiota.com/) without the official mobile application. This is a very incomplete placeholder project as on now. Best works with Raspberry Pi. (3 would be the best)

For protocol help, https://gist.github.com/arijitdasgupta/14f60d3189319ce707847a4f577291b8 which is also incomplete.

Requirements:
 - A Bluetooth LE enabled adapter or Raspberry Pi 3
 - GATTtool http://www.bluez.org/
 - `node` preferably `>=5.2.0`, `npm` preferably `>=3.3.12` (Use https://github.com/creationix/nvm for easy setup)

To Start:
```
npm install
node app.js
```

TODO:
 - Write express JS HTTP adapter
 - Try out with multiple bulbs
 - Write bot code with web-hooks
