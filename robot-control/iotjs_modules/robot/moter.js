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

var gpio = require('gpio');
var PWMServo = require('./pwm_servo');

var HIGH = true, LOW = false;
var defaultSpeed = 2000;

function Moter(moterPin) {
  moterPin = moterPin || {
    ain1: 20,
    ain2: 21,
    bin1: 24,
    bin2: 23,
  }

  this.moterGpio = {};

  for (var pin in moterPin) {
    this.moterGpio[pin] = gpio.openSync({pin: moterPin[pin], direction: gpio.DIRECTION.OUT});
    this.moterGpio[pin] .writeSync(LOW);
  }

  this.speed = new PWMServo();
  this.speed.begin();

  this.speed.setPWMFreq(1600);
  this.speedNum = defaultSpeed;
}

Moter.prototype.forward = function(value) {
  this.moterGpio.ain1.writeSync(LOW);
  this.moterGpio.ain2.writeSync(HIGH);
  this.moterGpio.bin1.writeSync(LOW);
  this.moterGpio.bin2.writeSync(HIGH);

  this.setSpeed(value);
}

Moter.prototype.backward = function(value) {
  this.moterGpio.ain1.writeSync(HIGH);
  this.moterGpio.ain2.writeSync(LOW);
  this.moterGpio.bin1.writeSync(HIGH);
  this.moterGpio.bin2.writeSync(LOW);

  this.setSpeed(value);
}

Moter.prototype.stop = function() {
  this.moterGpio.ain1.writeSync(LOW);
  this.moterGpio.ain2.writeSync(LOW);
  this.moterGpio.bin1.writeSync(LOW);
  this.moterGpio.bin2.writeSync(LOW);

  this.setSpeed();
}


Moter.prototype.right = function(value) {
  this.moterGpio.ain1.writeSync(HIGH);
  this.moterGpio.ain2.writeSync(LOW);
  this.moterGpio.bin1.writeSync(LOW);
  this.moterGpio.bin2.writeSync(HIGH);

  this.setSpeed(value);
}

Moter.prototype.left = function(value) {
  this.moterGpio.ain1.writeSync(LOW);
  this.moterGpio.ain2.writeSync(HIGH);
  this.moterGpio.bin1.writeSync(HIGH);
  this.moterGpio.bin2.writeSync(LOW);

  this.setSpeed(value);
}

Moter.prototype.close = function() {
  this.moter_gpio.forEach(function(gpio) {
    gpio.close();
  });
};

Moter.prototype.setSpeed = function(value) {
  if (value === undefined) {
    value = this.speedNum;
  } else {
    this.speedNum = value;
  }
  this.speed.setPWM(0, 900, value); // left
  this.speed.setPWM(1, 900, value);
}

module.exports = Moter;
