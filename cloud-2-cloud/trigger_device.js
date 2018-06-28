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

var fs = require('fs');
var console = require('console');
var st = require('./smartthings.js');
var config = require('./config.js')

if (!fs.existsSync(config.paths.deviceInstall)) {
    console.log('Unable to load installed device config file: %s',
                config.paths.deviceInstall);
    console.log('Please make sure that the C2C app is installed correctly');
    process.exit(-1);
}

/* Send a random number or an argument value */
var deviceNewValue = Math.floor(Math.random() * 100);

if (process.argv[2]) {
    deviceNewValue = +process.argv[2];
}

var deviceInfo = require(config.paths.deviceInstall);
var options = {
    authToken: config.authToken,
    deviceId: deviceInfo.deviceId,
};
var deviceData = {
    commands: [
        {
            component: 'main',
            capability: 'switchLevel',
            command: 'setLevel',
            arguments: [ deviceNewValue, ]
         }
    ]
}

st.device_command(options, deviceData, function(data) {
    console.log('Sent new switch value: %d', deviceNewValue);
});

