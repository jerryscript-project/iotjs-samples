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

var config = require('./config.js');
var st = require('./smartthings.js');
var sthook = require('./stwebhook.js');
var fs = require('fs');

var config_ok = true;
if (!config.authToken) {
    console.log('ERROR: No personal authToken specified in the config file');
    console.log('Please visit the https://account.smartthings.com/tokens page');
    console.log('To generate an authToken');
    console.log('');
    config_ok = false;
}

if (!config.targetUrl) {
    console.log('ERROR: No targetUrl specified in the config file');
    console.log('The targetUrl should be a publicly accessible https url');
    console.log('');
    config_ok = false;
}

if (!config.appName) {
    console.log('ERROR: No appName specified in the config file');
    console.log('The appName should be a globally unique name');
    console.log('');
    config_ok = false;
}

if (!config_ok) {
    process.exit(-1);
}

var demoApp = new sthook.STWebHook();

demoApp.on('CONFIGURATION', function(message, response) {
    console.log(' Got CONFIGURATION lifecycle');
    var data = {};

    if (message.configurationData.phase === 'INITIALIZE') {
        console.log(' Performing SmartApp initialization');
        this._installedAppId = message.configurationData.installedAppId;
        var initData = {
            name: 'Example IoT.js SmartC2C app',
            description: data.name,
            id: 'demoappc2c',
            permissions: [
                'l:devices',
                'r:devices:*',
                'x:devices:*',
                'r:schedules',
                'w:schedules',
                'i:deviceprofiles',
                'r:locations:*',
            ],
            firstPageId: '1',
        };

        data = { initialize: initData };
    } else if (message.configurationData.phase === 'PAGE') {
        var pageData = {
            pageId: '1',
            name: 'Example IoT.js SmartC2C app',
            nextPageId: null,
            previousPageId: null,
            complete: true,
            sections: [
                {
                    name: 'C-2-C config',
                    settings: [
                        {
                            id: 'magicKeySettings',
                            name: 'Magic key',
                            description: 'Magic key to configure something',
                            type: 'TEXT',
                            required: false,
                            defaultValue: '42',
                        },
                        {
                            id: 'debugLogging',
                            name: 'Use debug logging?',
                            description: '',
                            type: 'BOOLEAN',
                            required: true,
                            defaultValue: 'true',
                        },
                    ],
                }
            ],
        };

        data.page = pageData;
    }

    return { statusCode: 200, configurationData: data };
});


demoApp.on('INSTALL', function(message, response) {
    console.log(' Got INSTALL lifecycle');
    console.log(' Got authToken: %s', message.installData.authToken);

    this._installData = message.installData;
    fs.writeFileSync(config.paths.lastInstall, JSON.stringify(message));

    var deviceProfile = JSON.parse(fs.readFileSync(config.paths.deviceProfile));

    if (config.schedule) {
        var options = {
            authToken: message.installData.authToken,
            installedAppId: message.installData.installedApp.installedAppId,
        }
        console.log(' Trying to install a schedule');
        st.schedules_add(options, config.schedule, function(data, status_code) {
            if (status_code == 200) {
                console.log(' Schedule install OK');
            } else {
                console.log(' Schedule install failed');
            }
        });
    }

    var deviceData = {
        label: "Test dev",
        locationId: this._installData.installedApp.locationId,
        app: {
            profileId: deviceProfile.id,
            installedAppId: this._installData.installedApp.installedAppId,
            externalId: 'IOTJSD0001',
        }
    };
    st.device_install({authToken: this._installData.authToken}, deviceData, function(data) {
        console.log("Device installed:");
        console.log(data);
        fs.writeFileSync(config.paths.deviceInstall, JSON.stringify(data));
    });

    return { statusCode: 200, installData: {} };
});

demoApp.on('UPDATE', function(message, response) {
    console.log(' Got UPDATE lifecycle');

    fs.writeFileSync(config.path.newConfig, JSON.stringify(message));

    return { statusCode: 200, updateData: {} };
});

demoApp.on('EVENT', function(message, response) {
    console.log(' Got EVENT lifecycle');

    var events = message.eventData.events;

    for (var idx = 0; idx < events.length; idx++) {
        var event = events[idx];
        var eventData = {};
        switch (event.eventType) {
            case 'DEVICE_COMMANDS_EVENT': {
                console.log('  DEVICE Event triggered:')
                eventData = event.deviceCommandsEvent;
                break;
            }
            case 'DEVICE_EVENT': {
                console.log('  DEVICE Event triggered:')
                eventData = event.deviceEvent;
                break;
            }
            case 'TIMER_EVENT': {
                console.log('  TIMER Event triggered:')
                eventData = event.timerEvent;
                break;
            }
        }

        console.log(eventData);
    }

    return { statusCode: 200, eventData: {} };
});

var server = new sthook.STWebHookServer(config, demoApp);
server.createServer();
server.listen();
