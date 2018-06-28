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

var console = require('console');
var fs = require('fs');
var st = require('./smartthings.js')

var config = require('./config.js');

st.register_webhook(config, function(response, status_code) {
    console.log('WebHook Register Response:');
    console.log(response);
    if (status_code == 200) {
        fs.writeFileSync(config.paths.appProfile, JSON.stringify(response));

        var options = {
            authToken: config.authToken,
            appName: response.app.appId,
        };
        st.app_updateoauth(options, config.appOauth, function(data, status_code) {
            console.log('Update oauth response:');
            console.log(data);

            console.log('');
            console.log('Everything should be registered!');
            console.log('Please check the Android App');
        });
    }
});

st.deviceprofile_create(config, config.deviceProfile, function(data, status_code) {
    console.log('Device profile install response:');
    console.log(data);
    if (status_code == 200) {
        fs.writeFileSync(config.paths.deviceProfile, JSON.stringify(data));
        console.log('Device profile install DONE');
    }
});
