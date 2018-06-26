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

var log = require('log');
var Sensors = require('sensor');
var CloudDevice = require('clouddevice');

function start(config, actionHandler) {
  var sensors = new Sensors(config);
  var device = new CloudDevice(config.auth);

  var queryEndDate = lastSyncDate = Date.now();
  var syncInterval = config.sync.interval || 2000;

  var requestSyncSensors = function() {
    setTimeout(function() {
      // sync sensors
      sensors.fetch(function(errors, results) {
        // print if errors exist
        if (errors.length) {
          errors.forEach(function(item) {
            console.error('fetch error', item.name);
          });
        }

        // sync if results exist
        if (results.length) {
          var curDate = Date.now();
          var uptime = Math.floor((curDate - lastSyncDate)/100) * 100;
          var data = {
            id: config.id,
            uptime: uptime,
          };

          lastSyncDate = curDate;

          results.forEach(function(item) {
            data[item.name] = item.value;
          });

          // post data
          log('sync...');
          device.post(data, function(error) {
            error ? console.error(error) : log('done');
            requestSyncSensors();
          });
        }
      });
    }, syncInterval);
  }

  requestSyncSensors();

  log('start syncing sensors on #' + config.id);

  if (!actionHandler) {
    return;
  }

  var requestLastAction = function(interval) {
    setTimeout(function() {
      // polling actions
      var query = {
        startDate: queryEndDate,
        endDate: Date.now(),
        order: 'desc',
        count: 1,
      };

      device.get(query, function(error, result) {
        if (error) {
          console.error(error);
        } else {
          var data = result.data;

          if (data.length > 0) {
            var action = null;
            for (var i = 0, l = data.length; i < l; ++i) {
              if (data[i].data.actions) {

                data[i].data.actions.forEach(function(action) {
                  var cts = data[i].cts;
                  var ts = data[i].ts;

                  log(action);

                  switch (action.name) {
                    case 'setMode':
                      var value = +action.parameters.mode;
                      if (Number.isInteger(value)) {
                        syncInterval = Math.max(2000, value);
                        syncInterval = Math.min(10000, syncInterval);
                        log('interval is changed:', syncInterval);
                      }
                      break;
                    default:
                      break;
                  }

                  actionHandler(action);

                  queryEndDate = cts + 10; // offset: 10ms
                });
              }
            }
          }
          requestLastAction(interval);
        }
      });
    }, interval || 2000);
  }

  requestLastAction();

  log('start receiving actions');
}

module.exports = {
  start: start
};
