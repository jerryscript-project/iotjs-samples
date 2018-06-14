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

var Robot = require('robot');
var pin = require('pin');

var robot = new Robot(pin);
var speed = 2600;

robot.createServer(5555, function(_cmd, req, res) {
  var cmd = _cmd[0];
  console.log(cmd);
  if (cmd === 'forward') {
    robot.moter.forward(speed);
  } else if (cmd === 'backward') {
    robot.moter.backward(speed);
  } else if (cmd === 'stop') {
    robot.stop();
  } else if (cmd ==='sup') {
    speed += 100;
    if (speed > 4096) {
      speed = 4000;
    }
    robot.moter.setSpeed(speed);
  } else if (cmd === 'sdown') {
    speed -= 100;
    if (speed < 0) {
      speed = 0;
    }
    robot.moter.setSpeed(speed);
  } else if (cmd === 'go') {
    var e = _cmd[1];
    var des = Robot.HOME;
    if (e === 'A') {
      des = Robot.A;
    } else if (e === 'B') {
      des = Robot.B;
    }
    robot.go(des);
  }
  res.end(speed);
});
