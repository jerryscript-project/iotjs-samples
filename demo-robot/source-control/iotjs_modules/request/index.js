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

var https = require('https');
var url = require('url');

function request(options, data, callback) {
  if(options.protocol && options.protocol != 'https:') {
    throw new TypeError('now only for https');
  }

  var req = https.request(options, function(res) {
    var responseData = '';

    res.on('data', function(chunk) {
      responseData += chunk.toString();
    });

    res.on('end', function() {
      callback(null, responseData);
    });

    res.on('error', function(err) {
      callback(err);
    });
  })

  if (data) {
    req.end(new Buffer(data));
  } else {
    req.end();
  }
}

request.get = function(options, data, callback) {
  var query = {
    method: 'GET',
    rejectUnauthorized: false,
    headers: {'user-agent': 'iotjs'},
  };

  if (typeof options === 'string') {
    options = url.parse(options);
  }

  if (isObject(options)) {
    query = mixin(query, options);
  }

  request(query, data, callback);
}


function isObject(arg) {
  return typeof arg === 'object' && arg != null;
}


function mixin(target) {
  if (target === null || target === undefined) {
    throw new TypeError('target cannot be null or undefined');
  }

  for (var i = 1; i < arguments.length; ++i) {
    var source = arguments[i];
    if (!(target === null || target === undefined)) {
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          target[prop] = source[prop];
        }
      }
    }
  }

  return target;
}


module.exports = request;
