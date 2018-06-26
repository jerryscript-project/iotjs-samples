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

var pin_shift = {};

pin_shift.LSBFIRST = 0;
pin_shift.MSBFIRST = 1;

pin_shift.shiftIn =  function(dataPin, clockPin, bitOrder) {
  var value = 0;
  clockPin.setDirectionSync(gpio.DIRECTION.OUT);
  dataPin.setDirectionSync(gpio.DIRECTION.IN);
  for (var i = 0; i < 8; ++i) {
      digitalWrite(clockPin, HIGH);
      if (bitOrder == this.LSBFIRST)
          value |= dataPin.readSync() << i;
      else
          value |= dataPin.readSync() << (7 - i);
      clockPin.writeSync(0);
  }
  return value;
}

pin_shift.shiftOut = function(dataPin, clockPin, bitOrder, val) {
  clockPin.setDirectionSync(gpio.DIRECTION.OUT);
  dataPin.setDirectionSync(gpio.DIRECTION.OUT);

  for (var i = 0; i < 8; i++) {
      if (bitOrder == this.LSBFIRST) {
        dataPin.writeSync(!!(val & (1 << i)));
      } else {
        dataPin.writeSync(!!(val & (1 << (7 - i))));
      }
      clockPin.writeSync(1);
      clockPin.writeSync(0);
  }
}

module.exports = pin_shift;