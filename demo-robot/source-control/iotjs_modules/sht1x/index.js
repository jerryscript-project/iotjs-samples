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

/**
 * Copyright 2009 Jonathan Oxer <jon@oxer.com.au> / <www.practicalarduino.com>
 * Copyright 2008 Maurice Ribble <ribblem@yahoo.com> / <www.glacialwanderer.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * http://www.gnu.org/licenses/
 * https://github.com/practicalarduino/SHT1x
 */

var sleep = require('sleep');
var gpio = require('gpio');
var pin_shift = require('pin_shift');

var HIGH = 1, LOW = 0;

var _numBits;

/**
 * Reads the current raw temperature value
 */
function readTemperatureRaw(_dataPin, _clockPin) {
  var _val;

  // Command to send to the SHT1x to request Temperature
  var _gTempCmd  = 0x03;

  sendCommandSHT(_gTempCmd, _dataPin, _clockPin);
  waitForResultSHT(_dataPin);
  _val = getData16SHT(_dataPin, _clockPin);
  skipCrcSHT(_dataPin, _clockPin);

  return (_val);
}

function shiftIn(_dataPin, _clockPin, _numBits) {
  var ret = 0;
  var i;

  for (i = 0; i < _numBits; ++i) {
     _clockPin.writeSync(HIGH);
     sleep.usleepSync(10 * 1000);
     ret = ret * 2 + _dataPin.readSync();
     _clockPin.writeSync(LOW);
  }

  return(ret);
}

function sendCommandSHT(_command, _dataPin, _clockPin) {
  var ack;

  // Transmission Start
  _dataPin.setDirectionSync(gpio.DIRECTION.OUT);
  _clockPin.setDirectionSync(gpio.DIRECTION.OUT);
  _dataPin.writeSync(HIGH);
  _clockPin.writeSync(HIGH);
  _dataPin.writeSync(LOW);
  _clockPin.writeSync(LOW);
  _clockPin.writeSync(HIGH);
  _dataPin.writeSync(HIGH);
  _clockPin.writeSync(LOW);

  // The command (3 msb are address and must be 000, and last 5 bits are command)
  pin_shift.shiftOut(_dataPin, _clockPin, pin_shift.MSBFIRST, _command);

  // Verify we get the correct ack
  _clockPin.writeSync(HIGH);
  _dataPin.setDirectionSync(gpio.DIRECTION.IN);
  ack = _dataPin.readSync();
  if (ack != LOW) {
    console.log("Ack Error 0");
  }
  _clockPin.writeSync(LOW);
  ack = _dataPin.readSync();
  if (ack != HIGH) {
    console.log("Ack Error 1");
  }
}

function waitForResultSHT(_dataPin) {
  var ack;

  _dataPin.setDirectionSync(gpio.DIRECTION.IN);

  for (var i = 0; i < 100; ++i) {
    sleep.usleepSync(10 * 1000);
    ack = _dataPin.readSync();

    if (ack == LOW) {
      break;
    }
  }

  if (ack == HIGH) {
    // Can't do serial stuff here, need another way of reporting errors
    console.log("Ack Error 2");
  }
}

function getData16SHT(_dataPin, _clockPin) {
  var val;

  // Get the most significant bits
  _dataPin.setDirectionSync(gpio.DIRECTION.IN);
  _clockPin.setDirectionSync(gpio.DIRECTION.OUT);
  val = shiftIn(_dataPin, _clockPin, 8);
  val *= 256;

  // Send the required ack
  _dataPin.setDirectionSync(gpio.DIRECTION.OUT);
  _dataPin.writeSync(HIGH);
  _dataPin.writeSync(LOW);
  _clockPin.writeSync(HIGH);
  _clockPin.writeSync(LOW);

  // Get the least significant bits
  _dataPin.setDirectionSync(gpio.DIRECTION.IN);
  val |= shiftIn(_dataPin, _clockPin, 8);

  return val;
}

function skipCrcSHT(_dataPin, _clockPin) {
  // Skip acknowledge to end trans (no CRC)
  _dataPin.setDirectionSync(gpio.DIRECTION.OUT);
  _clockPin.setDirectionSync(gpio.DIRECTION.OUT);

  _dataPin.writeSync(HIGH);
  _clockPin.writeSync(HIGH);
  _clockPin.writeSync(LOW);
}


function Sht1x(dataPin, clockPin) {
  this._dataPin = dataPin;
  this._clockPin = clockPin;
}

Sht1x.prototype.readTemperatureC = function() {
  var _val,   // Raw value returned from sensor
    _temperature; // Temperature derived from raw value

  var D1 = -40.0, // for 14 Bit @ 5V
    D2 = 0.01; // for 14 Bit DEGC

  // Fetch raw value
  _val = readTemperatureRaw(this._dataPin, this._clockPin);

  // Convert raw value to degrees Celsius
  _temperature = (_val * D2) + D1;

  return (_temperature);
};

Sht1x.prototype.readTemperatureF = function() {
  var _val;                 // Raw value returned from sensor
  var _temperature;       // Temperature derived from raw value

  // Conversion coefficients from SHT15 datasheet
  var D1 = -40.0;   // for 14 Bit @ 5V
  var D2 =   0.018; // for 14 Bit DEGF

  // Fetch raw value
  _val = readTemperatureRaw(this._dataPin, this._clockPin);

  // Convert raw value to degrees Fahrenheit
  _temperature = (_val * D2) + D1;

  return (_temperature);
};

Sht1x.prototype.readHumidity = function() {
  var _val;                    // Raw humidity value returned from sensor
  var _linearHumidity;       // Humidity with linear correction applied
  var _correctedHumidity;    // Temperature-corrected humidity
  var _temperature;          // Raw temperature value

  // Conversion coefficients from SHT15 datasheet
  var C1 = -4.0;       // for 12 Bit
  var C2 =  0.0405;    // for 12 Bit
  var C3 = -0.0000028; // for 12 Bit
  var T1 =  0.01;      // for 14 Bit @ 5V
  var T2 =  0.00008;   // for 14 Bit @ 5V

  // Command to send to the SHT1x to request humidity
  var _gHumidCmd = 0x05;

  // Fetch the value from the sensor
  sendCommandSHT(_gHumidCmd, this._dataPin, this._clockPin);
  waitForResultSHT(this._dataPin);
  _val = getData16SHT(this._dataPin, this._clockPin);
  skipCrcSHT(this._dataPin, this._clockPin);

  // Apply linear conversion to raw value
  _linearHumidity = C1 + C2 * _val + C3 * _val * _val;

  // Get current temperature for humidity correction
  _temperature = this.readTemperatureC();

  // Correct humidity value for current temperature
  _correctedHumidity = (_temperature - 25.0 ) * (T1 + T2 * _val) + _linearHumidity;

  return (_correctedHumidity);
}


module.exports = Sht1x;
