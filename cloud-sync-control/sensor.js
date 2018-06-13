/* Copyright 2018-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var gpio = require('gpio') ? require('gpio') : require('./gpio');
var Sht1x = require('sht1x');
var log = require('log');

function Sensors(config) {
  this.id = config.id;
  this.fakeAirQuality = 0;

  this.enableExtraSensors(config);
}


Sensors.prototype.enableExtraSensors = function(config) {
  this.dataPin = gpio.openSync({pin: config.pin.shtDataPin});
  this.clockPin = gpio.openSync({pin: config.pin.shtClockPin});
  this.sht10 = new Sht1x(this.dataPin, this.clockPin);
}

Sensors.prototype.fetch = function(callback) {
  var t, h, aq, id, str = '', results = [];

  id = this.id;

  if (this.sht10) {
    t = this.sht10.readTemperatureC();
    h = this.sht10.readHumidity();
  }

  if (this.fakeAirQuality != 0) {
    if (id == 1) {
      aq = this.fakeAirQuality;
    }
  } else {
    // TODO: aq = this.sht10.readAirQuality();
    aq = 7;
  }

  // make a parcel for cloud

  if (aq !== undefined) {
    results.push({
      name: 'airQuality' + id,
      value: aq,
    });
    str += 'aq:' + aq + ' ';
  }

  if (t !== undefined) {
    results.push({
      name: 'temperature' + id,
      value: t,
    });
    str += 't:' + t + ' ';
  }

  if (h !== undefined) {
    results.push({
      name: 'humidity' + id,
      value: h,
    });
    str += 'h:' + h + ' ';
  }

  (str != '') ? log(str) : str;

  callback(null, results);
};


Sensors.prototype.setAirQuality = function(value) {
  this.fakeAirQuality = value;
}

module.exports = Sensors;
