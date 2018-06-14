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

var request = require('request');
var mqtt = require('mqtt');
var querystring = require('querystring');
var mixin = require('util').mixin;

// regarding rate-limiting
// https://developer.artik.cloud/documentation/data-management/rate-limiting.html
// check HTTP headers to the limit. console.log(JSON.stringify(res.headers));

var CloudDevice = function(options) {
  this.deviceID = options.deviceID;
  this.deviceToken = options.deviceToken;
  this.hostname = options.hostname;
  this.userAgent = options.userAgent;
  this.queryEndDate = Date.now();

  this.mqttclient = null;
};

CloudDevice.prototype.subscribeAction = function(callback) {
  var device_id = this.deviceID;
  var device_token = this.deviceToken;
  var self = this;

  var clientOpts = {
    port: 8883,
    username: device_id,
    password: device_token,
    keepalive: 30,
  };

  self.mqttclient = mqtt.connect('mqtts://api.artik.cloud', clientOpts);

  self.mqttclient.on('connect', function() {
    self.mqttclient.subscribe('/v1.1/actions/' + device_id);
  });

  self.mqttclient.on('message', function(data) {
    var parsed = JSON.parse(data.message.toString());
    if (parsed.actions) {
      var action = parsed.actions[0];
      callback(action);
    }
  });
}

function createResultHandler(callback) {
  return function(err, data, res) {

    // The number of remaining requests in the current period (minute/daily).
    // console.log('X-Rate-Limit-Remaining:', res.headers['X-Rate-Limit-Remaining']);
    // Unix epoch timestamp (in seconds) marking when the counter will reset
    // and allow one or more requests to be made (minute/daily). For the sliding
    // one-minute window, this denotes the time when the next (oldest) call will expire.
    // console.log('X-Rate-Limit-Reset:', res.headers['X-Rate-Limit-Reset']);
    // The maximum number of allowed requests in the current period (minute/daily).
    // console.log('X-Rate-Limit-Limit:', res.headers['X-Rate-Limit-Limit']);

    if (err) {
      callback(err);
    } else if (!data) {
      callback('no data');
    } else {
      var parsed = JSON.parse(data.toString());
      if (parsed.error) {
        callback(parsed.error.message);
      } else {
        callback(null, parsed, res);
      }
    }
  };
}

CloudDevice.prototype.postMessage = function(data, callback) {
  var message = JSON.stringify({
    sdid: this.deviceID,
    data: data,
  });

  request({
    hostname: this.hostname,
    method: 'POST',
    path: '/v1.1/messages',
    rejectUnauthorized: false,
    headers: {
      'Content-Length': message.length,
      'Authorization': 'Bearer ' + this.deviceToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': this.userAgent,
    },
  },
  message,
  createResultHandler(callback));
};

CloudDevice.prototype.getLastMessage = function(callback) {
  var query = {
    sdids: this.deviceID,
  };

  request({
    hostname: this.hostname,
    method: 'GET',
    path: '/v1.1/messages/last?' + querystring.encode(query),
    rejectUnauthorized: false,
    headers: {
      'Authorization': 'Bearer ' + this.deviceToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': this.userAgent,
    },
  },
  null,
  createResultHandler(callback));
}

CloudDevice.prototype.getSnapshots = function(callback) {
  var query = {
    sdids: this.deviceID,
  };

  request({
    hostname: this.hostname,
    method: 'GET',
    path: '/v1.1/messages/snapshots?' + querystring.encode(query),
    rejectUnauthorized: false,
    headers: {
      'Authorization': 'Bearer ' + this.deviceToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': this.userAgent,
    },
  },
  null,
  createResultHandler(callback));
}

CloudDevice.prototype.getActions = function(options, callback) {

  var query = mixin(options, {
    ddid: this.deviceID,
  });

  request({
    hostname: this.hostname,
    method: 'GET',
    path: '/v1.1/actions?' + querystring.encode(query),
    rejectUnauthorized: false,
    headers: {
      'Authorization': 'Bearer ' + this.deviceToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': this.userAgent,
    },
  },
  null,
  createResultHandler(callback));
};

CloudDevice.prototype.getLastAction = function(callback) {
  // polling one single action
  var query = {
    startDate: this.queryEndDate,
    endDate: Date.now(),
    order: 'desc',
    count: 1,
  };

  this.getActions(query, parseActions);

  var self = this;

  function parseActions(error, result) {
    var action = null;

    if (error) {
      console.log(error);
      return;
    }

    var data = result.data;
    if (data.length > 0) {

      for (var i = 0, l = data.length; i < l; ++i) {
        if (data[i].data.actions) {
          data[i].data.actions.forEach(function(action) {
            var cts = data[i].cts;
            self.queryEndDate = cts + 10; // offset: 10ms

            callback(null, action);
          });
        }
      }
    } else {
      callback(null, null);
    }
  }
}


module.exports = CloudDevice;
