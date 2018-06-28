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

var commands = {
    app_list: function() {
        var options = {
            authToken: config.authToken,
        };

        st.app_list(options, function(data) {
            console.log("List APP results:");
            console.log(data);
        });
    },

    app_delete: function(args) {
        if (args.length < 1) {
            console.log("Missing appName/appId argument")
            return;
        }

        var options = {
            authToken: config.authToken,
            appName: args[0],
        };

        st.app_delete(options, function(data) {
            console.log("Delete result:")
            console.log(data);
        });
    },

    app_get: function(args) {
        if (args.length < 1) {
            console.log("Missing appName/appId argument")
            return;
        }

        var options = {
            authToken: config.authToken,
            appName: args[0],
        };

        st.app_get(options, function(data) {
            console.log("App get result: ");
            console.log(data);
        });
    },

    app_getoauth: function(args) {
        if (args.length < 1) {
            console.log("Missing appName/appId argument")
            return;
        }

        var options = {
            authToken: config.authToken,
            appName: args[0],
        };

        st.app_getoauth(options, function(data) {
            console.log("Oauth infos:");
            console.log(data);
        });
    },

    app_updateoauth: function(args) {
        if (args.length < 1) {
            console.log("Missing appName/appId argument")
            return;
        }

        var options = {
            authToken: config.authToken,
            appName: args[0],
        };
        var content = {
            clientName: "Demo client 001",
            scope: [
                "l:devices",
                "r:devices:*",
                "w:devices:*",
                "x:devices:*",
                "r:installedapps",
                "w:installedapps",
            ],
        };
        st.app_updateoauth(options, content, function(data) {
            console.log("Update oauth response:");
            console.log(data);
        });
    },


    deviceprofile_list: function() {
        st.deviceprofile_list({authToken: config.authToken}, function(data) {
            console.log("List deviceprofiles:");
            console.log(data);
        });
    },

    deviceprofile_delete: function(args) {
        st.deviceprofile_delete({authToken: config.authToken}, args[0], function(data) {
            console.log("Deleted deviceprofile:");
            console.log(data);
        });
    },

    device_list: function() {
        st.device_list({authToken: config.authToken}, function(data) {
            console.log("List devices:");
            console.log(data);
        });
    },

    device_install: function(args) {
        var deviceData = {
            label: "Test dev",
            locationId: args[2],
            app: {
                profileId: args[1],
                installedAppId: args[0],
            }
        };
        st.device_install({authToken: config.authToken}, deviceData, function(data) {
            console.log("Device install:");
            console.log(data);
        });
    },

    device_cmd: function(args) {
        var options = {
            authToken: config.authToken,
            deviceId: args[0],
        };
        var deviceData = {
            commands: [
                {
                    component: 'main',
                    capability: 'switchLevel',
                    command: 'setLevel',
                    arguments: [
                        Number(args[1]),
                    ]
                }
            ]
        }
        st.device_command(options, deviceData, function(data) {
            console.log('Send Dev data');
        });
    },

    installedapps_list: function() {
        st.installedapps_list({authToken: config.authToken}, function(data) {
            console.log("Installed apps:");
            console.log(data);
        });
    },

    installedapps_delete: function(args) {
        if (args.length < 1) {
            console.log("Missing appName/appId argument")
            return;
        }

        var options = {
            authToken: config.authToken,
            installedAppId: args[0],
        };

        st.installedapps_delete(options, function(data) {
            console.log("Uninstall result:");
            console.log(data);
        });
    },

    installedapps_delete_all: function() {
        var options = {authToken: config.authToken};
        st.installedapps_list(options, function(data) {
            console.log("Removing apps:");
            for (var idx = 0; idx < data.items.length; idx++) {
                console.log(' Removing -> %s: %s', data.items[idx].displayName, data.items[idx].installedAppId);
                options.installedAppId = data.items[idx].installedAppId;
                st.installedapps_delete(options, function(data) {
                    if (data.count === 1) {
                        console.log('  Delete OK');
                    }
                });
            }
        });
    },

    installedapps_post: function(args) {
        if (args.length < 1) {
            console.log("Missing appName/appId argument")
            return;
        }

        var options = {
            authToken: config.authToken,
        };
        var appData = {
            installedAppType: "WEBHOOK_SMART_APP",
            displayName: "demoappinst0037",
            appId: args[0],
            locationId: args[1],
            configurationStatus: "DONE",
        };

        st.installedapps_post(config, appData, function(data) {
            console.log("Install result:");
            console.log(data);
        });
    },

    installedapps_configs: function(args) {
        var options = {
            authToken: config.authToken,
            installedAppId: args[0],
        };
        st.installedapps_configs(options, function(data) {
            console.log("ConfigData:");
            console.log(data);
        });
    },

    installedapps_config: function(args) {
        var options = {
            authToken: config.authToken,
            installedAppId: args[0],
            configurationId: args[1],
        };
        st.installedapps_config(options, function(data) {
            console.log("Single ConfigData:");
            console.log(data);
        });
    },

    locations_list: function() {
        st.locations_list({authToken: config.authToken}, function(data) {
            console.log("Locations:");
            console.log(data);
        });
    }



};

if (process.argv.length > 2 && commands[process.argv[2]]) {
    commands[process.argv[2]](process.argv.splice(3));
} else {
    console.log("Available commands:");
    console.log(Object.keys(commands).join(", "));
}
