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

var FSM = require('fsm');
var inherits = require('util').inherits;
var log = require('log');

function Robot(config) {
  FSM.call(this, config);
}

inherits(Robot, FSM);

Robot.prototype.execute = function(cmd, callback, timeout) {
  log('robot:' + cmd);
  setTimeout(callback, timeout || 5000);
}

module.exports = Robot;
