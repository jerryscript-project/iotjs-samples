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

var ws = require('websocket');

var websocket = new ws.Websocket();

var device_id = "DEVICE ID";
var device_token = "DEVICE TOKEN";

function getTimeMillis(){
	return parseInt(Date.now().toString());
}

function register() {
  var reg_object = {
    type: "register",
    sdid: device_id,
    Authorization: "bearer " + device_token,
    cid: getTimeMillis(),
  };
  console.log('Sending register message ' + JSON.stringify(reg_object));
  websocket.send(JSON.stringify(reg_object), {mask: true});
}

function sendTemp(temp) {
  var data_object = {
    sdid: device_id,
    ts: getTimeMillis(),
    data: {
      temp: temp,
    },
    cid: getTimeMillis(),
  };
  console.log('Sending temperature data ' + JSON.stringify(data_object));
  websocket.send(JSON.stringify(data_object), {mask: true});
}

websocket.on('message', function(msg) {
  console.log('Received message: ' + msg);
  var parsed_msg = JSON.parse(msg);
});

websocket.on('connect', function() {
  console.log('Websocket connection is open ....');
  register();
  sendTemp(73);
});

websocket.connect('wss://api.artik.cloud', 443, '/v1.1/websocket?ack=true');
