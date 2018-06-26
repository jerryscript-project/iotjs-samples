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
var snapshot = require('cloudsnapshot');
var mixin = require('util').mixin;
var log = require('log');
var config = require('./config').get();

// create cloud device
var device = new CloudDevice(config.auth);
device = mixin(device, snapshot);

// task queue
var queue = [];

// deme sites
var cur_dest = '0';
var cur_bad = '0';

var rule = {
  humidity: 55,
  airQuality: 8,
};

// state defination
var robot = new Robot({
  init: 'start',
  states: {
    start: ['idle'],
    idle: ['move', 'end'],
    move: ['temp', 'humidity', 'air'],
    temp: ['idle', 'humidity', 'temp'],
    humidity: ['idle', 'humidity', 'temp'],
    air: ['idle'],
    end: [],
  }
});

// move state
robot.on('move', function(dest, callback) {
  this.execute('move '+ dest, callback);

}).on('move:exit', function(dest, bad) {
  log('move:exit', dest + ':' + bad);

  switch (bad) {
    case 'H':
      robot.go('humidity');
    break;
    case 'T':
      robot.go('temp');
    break;
    case 'A':
      robot.go('air');
    break;
    default:
    break;
  }
});

// humidity state
robot.on('humidity', function() {
  var handler = function() {
    // check if humidity is ok
    device.humidity(cur_dest, function(err, value, res) {
      log('check humidity'+cur_dest, value, res.headers['X-Rate-Limit-Remaining']);

      if (value < rule.humidity) {
        robot.go('idle');
      } else {
        robot.execute('humidity down', handler);
      }
    });
  };

  robot.execute('humidity down', handler);

}).on('humidity:exit', function() {
  log('humidity:exit');
  cur_bad = 0;
});


// air state
robot.on('air', function() {
  var handler = function() {
    // check if air is ok
    device.airQuality(cur_dest, function(err, value, res) {
      log('check air quality'+cur_dest, value, res.headers['X-Rate-Limit-Remaining']);

      if (value < rule.airQuality) {
        robot.go('idle');
      } else {
        robot.execute('air quality down', handler);
      }
    });
  };
  robot.execute('air quality down', handler);

}).on('air:exit', function() {
  log('air:exit');
  cur_bad = 0;
});

robot.on('idle', request_idle_action);

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

      cur_dest = dest;
      cur_bad = bad;

      robot.go('move', dest, function() {
        robot.end(dest, bad);
      });
    } else {
      request_idle_action();
    }

  }, interval || 1000);
}

// start robot
reset();

// start listening action
subscribeAction();


function subscribeAction() {
  device.subscribeAction(function(action) {
    if (action) {
      log(action);

      switch (action.name) {
        case 'setMode':
          var task_raw = action.parameters.mode;
          var task = task_raw.split(':');
          var cmd = task[0];
          var bad = task[1];

          handle_task_queue(task_raw, cmd, bad);
          break;
        default:
          break;
      }
    }
  });
};

// app reset

function reset() {
  cur_dest = '0';
  cur_bad = '0';
  queue.length = 0;
  robot.go('idle');
  show_queue_state();
}

// task queue handler

function handle_task_queue(task_raw, cmd, bad) {
  switch (cmd.toUpperCase()) {
    case 'R':
      reset();
    break;
    case '1':
    case '2':
    case '3':
      if (queue.indexOf(task_raw) < 0) {
        if ((cur_dest == cmd) && (cur_bad == bad)) {
          log('action skipped', cur_dest, cur_bad);
        } else {
          // check if currnet robot pos is same with new task
          if (cur_dest == cmd) {
            queue.unshift(task_raw);
          } else {
            queue.push(task_raw);
          }
          show_queue_state();
        }
      } else {
        log('action skipped');
      }
      break;
    default:
      break;
  }
}

function show_queue_state() {
  log(queue.length + ' left:', queue);
}

// listening actions

function request_last_action(interval) {
  setTimeout(function() {
   device.getLastAction(function(error, action) {
     if (action) {
      log(action.name);

      switch (action.name) {
        case 'setMode':
          var task_raw = action.parameters.mode;
          var task = task_raw.split(':');
          var cmd = task[0];
          var bad = task[1];

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

function request_last_action_mock(interval) {
  var Mock = require('mock');
  var mockio = new Mock('action');
  setTimeout(function() {
    var task_raw = mockio.read();
    if (task_raw != '0') {
      var task = task_raw.split(':');
      var cmd = task[0];
      var bad = task[1];

      handle_task_queue(task_raw, cmd, bad);

      mockio.write(0);
    }
    request_last_action_mock();
  }, interval || 2000);
}
