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

var CloudDevice = require('clouddevice');
var Robot = require('robotcore');
var log = require('log');

var config = require('./config').get();
var device = new CloudDevice(config.auth);

var cur_target = '0';

var queue = [];

function show_queue_state() {
  log(queue.length + ' left:', queue);
}

var robot = new Robot({
  init: 'start',
  states: {
    start: ['idle'],
    idle: ['move', 'end'],
    move: ['temp', 'humidity'],
    temp: ['idle'],
    humidity: ['idle'],
    end: [],
  }
});

robot.on('move', function(dest, callback) {
  this.execute('move '+ dest, callback);

}).on('move:exit', function() {
  log('move:exit');
});

robot.on('temp', function() {
  this.execute('temp down', robot.pending_next(), 5000);

}).on('temp:exit', function() {
  log('temp:exit');
});

robot.on('idle', request_idle_action);

reset();

function reset() {
  cur_target = '0';
  queue.length = 0;
  robot.go('idle');
  show_queue_state();
}

function request_idle_action(interval) {
  setTimeout(function() {
    log('idle');

    // check if any task exist
    if (queue.length > 0) {
      var str = queue.shift();
      var task = str.split(':');

      show_queue_state();

      var dest = task[0];
      var bad = task[1];

      cur_target = dest;

      robot.go('move', dest, robot.pending_next('temp'));

    } else {
      request_idle_action();
    }

  }, interval || 1000);
}

// listening actions

function handle_task_queue(task_raw, cmd, bad) {
  switch (cmd.toUpperCase()) {
    case 'R':
      reset();
    break;
    case '1':
    case '2':
    case '3':
      if (queue.indexOf(task_raw) < 0) {
        // check if currnet robot pos is same with new task
        if (cur_target == cmd) {
          queue.unshift(task_raw);
        } else {
          queue.push(task_raw);
        }
        show_queue_state();
      }
      break;
    default:
      break;
  }
}

function request_last_action(interval) {
  setTimeout(function() {
   device.getLastAction(function(error, action) {
     if (action) {
       log(action);

       var task_raw = action.parameters.mode;
       var task = task_raw.split(':');
       var cmd = task[0];
       var bad = task[1];

       switch (action.name) {
         case 'setMode':
          handle_task_queue(task_raw, cmd, bad);
          break;
         default:
           break;
       }
     }

     request_last_action();
   });
  }, interval || 2000);
 }

var Mock = require('mock');
var mockio = new Mock('action');

function request_last_action_mock(interval) {
  setTimeout(function() {
    var data = mockio.read();
    if (data != '0') {
      var task = data + ':Temp';
      if (queue.indexOf(task) < 0) {
        queue.push(task);
        show_queue_state();
      }

      mockio.write(0);
    }
    request_last_action_mock();
  }, interval || 2000);
}

request_last_action();
// request_last_action_mock();
