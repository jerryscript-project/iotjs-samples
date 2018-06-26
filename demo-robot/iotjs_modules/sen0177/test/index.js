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

var uart = require('uart');

var DATA_LENGTH = 31;

function Sen0177(config) {
  this.receiveData = null;
  this.receiveLength = 0;
  this.readStartFlag = false;

  this.PM01Value = this.PM2_5Value = this.PM10Value = -1;

  config.baudRate = 9600;
  config.dataBits = 8;
  this.serial = uart.openSync(config);
  this.serial.on('data', this._onData.bind(this));
}

Sen0177.prototype._onData = function(data) {
  if (data.length <= 0) {
    return;
  }
  if (this.readStartFlag === false) {
    if (data.readUInt8(0) === 0x42) {
      this.readStartFlag = true;
      this.receiveData = new Buffer(DATA_LENGTH);
      this.receiveLength = 0;
    }
  } else {
    for (var i = 0; i < data.length; i++) {
      this.receiveData.writeUInt8(data.readUInt8(i), this.receiveLength++);
      if (this.receiveLength === DATA_LENGTH) {
        this.readStartFlag = false;

        if (this._checkValue() === true) {
          this.PM01Value = this._transmitPM01();
          this.PM2_5Value = this._transmitPM2_5();
          this.PM10Value = this._transmitPM10();
          return;
        }
      }
    }
  }
}

Sen0177.prototype._checkValue = function() {
  var receiveFlag = false;
  var receiveSum = 0;

  for (var i = 0; i < (DATA_LENGTH - 2); i++) {
    receiveSum = receiveSum + this.receiveData.readUInt8(i);
  }
  receiveSum = receiveSum + 0x42;

  if (receiveSum == ((this.receiveData.readUInt8(DATA_LENGTH - 2) << 8) +
    this.receiveData.readUInt8(DATA_LENGTH - 1))) {  //check the serial data 
    receiveSum = 0;
    receiveFlag = true;
  }

  return receiveFlag;
}

Sen0177.prototype._transmitPM01 = function() {
  return ((this.receiveData.readUInt8(3) << 8) +this. receiveData.readUInt8(4));
}

Sen0177.prototype._transmitPM2_5 = function() {
  return ((this.receiveData.readUInt8(3) << 8) + this.receiveData.readUInt8(4));
}

Sen0177.prototype._transmitPM10 = function() {
  return ((this.receiveData.readUInt8(7) << 8) + this.receiveData.readUInt8(8));
}

Sen0177.prototype.getPM01 = function() {
  return this.PM01Value;
}

Sen0177.prototype.getPM2_5 = function() {
  return this.PM2_5Value;
}

Sen0177.prototype.getPM10 = function() {
  return this.PM10Value;
}


module.exports = Sen0177;
