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

function Sensors(config) {
  this.id = config.id;
  this.dataPin = gpio.openSync({pin: config.pin.shtDataPin});
  this.clockPin = gpio.openSync({pin: config.pin.shtClockPin});
  this.sht10 = new Sht1x(this.dataPin, this.clockPin);
}

Sensors.prototype.fetch = function(callback) {
  var t, h, results = [];

  t = this.sht10.readTemperatureC();
  h = this.sht10.readHumidity();

  results.push({
    name: 'temperature' + this.id,
    value: t,
  });

  results.push({
    name: 'humidity' + this.id,
    value: h,
  });

  callback(null, results);
};

module.exports = Sensors;
