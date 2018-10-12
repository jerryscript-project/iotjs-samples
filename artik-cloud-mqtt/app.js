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

var mqtt = require('mqtt');
var tls = require('tls');

var device_id = 'DEVICE ID';
var device_token = 'DEVICE TOKEN';

var clientOpts = {
  port: 8883,
  username: device_id,
  password: device_token,
  keepalive: 30,
};

function getMsg() {
  var temperature = Math.round(Math.random() * 100);

  return JSON.stringify({
    "temp": temperature,
  });
}

var publishCounter = 0;

var client = mqtt.connect('mqtts://api.artik.cloud', clientOpts);

function keepPublishing() {
  setInterval(function() {
    client.publish('/v1.1/messages/' + device_id, getMsg());
    publishCounter++;

    if (publishCounter == 10) {
      clearInterval(this);
      client.end();
    }
  }, 500);
}

client.on('connect', function() {
  // Subscribe to the actions channel
  client.subscribe('/v1.1/actions/' + device_id);
  keepPublishing();
});
