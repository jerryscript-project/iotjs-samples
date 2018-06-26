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

var i2c = require('i2c');
var sleep;
try {
  sleep = require('sleep');
} catch(e) {
  // temporary fix for x86 mock test
  sleep = {
    usleepSync: function() { return 0; }
  };
}

var PCA9685_SUBADR1 = 0x2;
var PCA9685_SUBADR2 = 0x3;
var PCA9685_SUBADR3 = 0x4;

var PCA9685_MODE1 = 0x0;
var PCA9685_PRESCALE = 0xFE;

var LED0_ON_L = 0x6;
var LED0_ON_H = 0x7;
var LED0_OFF_L = 0x8;
var LED0_OFF_H = 0x9;

var ALLLED_ON_L = 0xFA;
var ALLLED_ON_H = 0xFB;
var ALLLED_OFF_L = 0xFC;
var ALLLED_OFF_H = 0xFD;

function PWMServo(address) {
  address = address || 0x40;
  this.i2c = i2c.openSync({
    address: address,
    bus: 1
  });
}

PWMServo.prototype.begin = function() {
  this.reset();
  this.setPWMFreq(1000);
}

PWMServo.prototype.reset = function() {
  this.i2c.writeSync([PCA9685_MODE1, 0x80]);
  sleep.usleepSync(10000);
}

PWMServo.prototype.setPWMFreq = function(freq) {
  freq *= 0.9;  // Correct for overshoot in the frequency setting (see issue #11).
  var prescaleval = 25000000;
  prescaleval /= 4096;
  prescaleval /= freq;
  prescaleval -= 1;

  // var prescale = Buffer(1);
  // prescale.writeUInt8(Math.floor(prescaleval + 0.5));

  // var oldmode = Buffer(1);
  // oldmode.writeUInt8(this.read8(PCA9685_MODE1))

  // var newmode = Buffer(1);
  // newmode.writeUInt8((oldmode.readUInt8(0) & 0x7F) | 0x10); // sleep

  // this.i2c.writeSync([PCA9685_MODE1, newmode.readUInt8(0)]); // go to sleep
  // this.i2c.writeSync([PCA9685_PRESCALE, prescale.readUInt8(0)]); // set the prescaler
  // this.i2c.writeSync([PCA9685_MODE1, oldmode.readUInt8(0)]);
  // sleep.usleepSync(5000);
  // this.i2c.writeSync([PCA9685_MODE1, oldmode.readUInt8(0) | 0xa0]);  //  This sets the MODE1 register to turn on auto increment.


  var prescale = Math.floor(prescaleval + 0.5);
  var oldmode = this.read8(PCA9685_MODE1)[0];
  var newmode = (oldmode & 0x7F) | 0x10;
  this.i2c.writeSync([PCA9685_MODE1, newmode]); // go to sleep
  this.i2c.writeSync([PCA9685_PRESCALE, prescale]); // set the prescaler
  this.i2c.writeSync([PCA9685_MODE1, oldmode]);
  sleep.usleepSync(5000);
  this.i2c.writeSync([PCA9685_MODE1, oldmode | 0xa0]);
}

PWMServo.prototype.setPWM = function(num, on, off) {
  // var numBuffer = Buffer([_num]);
  // var num = numBuffer.readUInt8(0);

  // var onBuffer = Buffer([_on]);
  // var on = onBuffer.readUInt8(0);

  // var offBuffer = Buffer([_off]);
  // var off = offBuffer.readUInt8(0);

  on = (on < 0) ? 0 : on;
  on = (on > 4096) ? 4096 : on;

  off = (off < 0) ? 0 : off;
  off = (off > 4096) ? 4096 : off;

  this.i2c.writeSync([LED0_ON_L+4*num, on, on>> 8, off, off>> 8]);
}

PWMServo.prototype.read8 = function(addr) {
  this.i2c.writeSync([addr]);
  return this.i2c.readSync(1);
}

module.exports = PWMServo;

