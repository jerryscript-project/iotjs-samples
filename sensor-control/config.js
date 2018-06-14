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

var auth = require('./auth');
var default_id = 1;
var pin = {};

if (process.argv.length > 2) {
  default_id = process.argv[2];
}

switch(process.platform) {
  case 'linux':
  case 'tizen':
    pin.shtDataPin = 5;
    pin.shtClockPin = 6;
  break;

  case 'tizenrt':
    pin.shtDataPin = 30;
    pin.shtClockPin = 32;
  break;

  case 'nuttx':
  default:
    throw new Error('Unsupported platform');
  break;
}

console.log('device #' + default_id);

module.exports = {
  get: function(id) {
    id = id ? id : default_id;

    return {
      id: id,
      pin: pin,
      auth: auth,
      sync: {
        interval: 2000,
      },
    };
  }
};
