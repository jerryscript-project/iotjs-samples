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
var querystring = require('querystring');
var mixin = require('util').mixin;


var CloudDevice = function(options) {
  this.deviceID = options.deviceID;
  this.deviceToken = options.deviceToken;
  this.hostname = options.hostname;
  this.userAgent = options.userAgent;
};

function createResultHandler(callback) {
  return function(err, data) {
    if (err) {
      callback(err);
    } else if (!data) {
      callback('no data');
    } else {
      var parsed = JSON.parse(data.toString());
      if (parsed.error) {
        callback(parsed.error.message);
      } else {
        callback(null, parsed);
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


module.exports = CloudDevice;
