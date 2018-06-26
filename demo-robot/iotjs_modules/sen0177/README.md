# Sen0177

This module is for PM2.5 laser dust sensor(SEN0177).
To know more about this sensor, visit [here](https://www.dfrobot.com/wiki/index.php/PM2.5_laser_dust_sensor_SKU:SEN0177).

This module requires `uart` module.

## Class: Sen0177

### new Sen0177(config)
* `config` {Object}
  * `device` {string} Mandatory configuration. The specified device path.(Linux, Nuttx and TizenRT only)
  * `port` {number} Mandatory configuration. The specified port number. (Tizen only)

### sen0177.getPM01
* Returns: {number} It it returns `-1`, it is a read failure.

Get PM 1.0 value from dust sensor.


### sen0177.getPM2_5
* Returns: {number} It it returns `-1`, it is a read failure.

Get PM 2.5 value from dust sensor.


### sen0177.getPM10
* Returns: {number} It it returns `-1`, it is a read failure.

Get PM 10 value from dust sensor.

**Example**

```js
var sen0177 = new Sen0177({device: '/dev/ttyS0'});

console.log(sen0177.getPM01(), sen0177.getPM2_5(), sen0177.getPM10());
```
