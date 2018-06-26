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

var connected = false;
var pingresp = false;
var subscribed = false;

var msg_received;

var subOpts = {
  topic: 'iotjs/gitupdate',
};

var subClientOpts = {
  clientId: 'iotjs-mqtt-test-sub',
  host: '13.125.245.19',
  port: 1883,
  keepalive: 30,
};

var subClient = mqtt.connect(subClientOpts, function() {
  connected = true;
  console.log("subClient.connect");

  subClient.on('pingresp', function() {
    pingresp = true;
    console.log("subClient.pingresp");
    subClient.subscribe(subOpts);
  });

  subClient.on('suback', function() {
    subscribed = true;
    console.log("subClient.suback");
  });

  subClient.on('message', function(data) {
    msg_received = data.message;
    console.log("message: " + msg_received.toString());
  });

  subClient.ping();
});

process.on('exit', function() {
  assert.equal(connected, true);
  assert.equal(subscribed, true);
  assert.equal(pingresp, true);
});
