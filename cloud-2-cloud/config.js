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

var localConfig;

try {
    localConfig = require('./local_config.json');
} catch (e) {
    console.log('No local config found!');
    console.log('Please create a "local_config.json" file with the following object keys:');
    console.log('appName - the name of the app, must be a globally unique (do not use upper case letters!)');
    console.log('displayName - the name which will be displayed');
    console.log('targetUrl - the publicly accessible url by the ST cloud, must be a https url!');
    consoel.log('localPort - the local port on which the application should listen');
    console.log('authToken - the authToken issued by the https://account.smartthings.com/tokens page');

    process.exit(-2);
}


module.exports = {
    /* appName must be globally unique!!!! */
    appName: localConfig.appName,
    displayName: localConfig.displayName,
    /* The publicly accessible url */
    targetUrl: localConfig.targetUrl,
    /* generated via https://account.smartthings.com/tokens */
    authToken: localConfig.authToken,

    localPort: localConfig.localPort,

    /* C2C application specific configurations */
    description: 'Demo desc',
    deviceProfile: {
        name: 'demoapp.dev.model1',
        components: [
            /* only main capability is supported */
            {
                id: 'main',
                capabilities: [
                    { id: 'switchLevel'},
                ],
            },
        ],
        metadata: null,
    },
    appOauth: {
        clientName: "Demo client 001",
        scope: [
            "i:deviceprofiles",
            "l:devices",
            "r:devices:*",
            "r:installedapps:*",
            "r:locations:*",
            "r:schedules",
            "w:devices:*",
            "w:schedules",
            "x:devices:*"
        ],
    },
    schedule: {
        name: 'x-schedule',
        cron: {
            /* Trigger every 5 minutes */
            expression: '0/5 * * * ?',
            timezone: 'UTC',
        }
    },

    /* Set of paths were a few configs are saved */
    paths: {
        appProfile: './result_appprofile.json',
        deviceProfile: './result_appdeviceprofile.json',
        lastInstall: './result_appinstallconfig.json',
        deviceInstall: './result_appdeviceinstall.json',

        newConfig: './result_appupdate.json',
    },
};
