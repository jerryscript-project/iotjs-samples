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

var _API = {
    host: 'api.smartthings.com',
    path: '/v1',
    port: 443, /* https */
};

var assert = require('assert');
if (!assert.assert) {
    assert.assert = assert.ok;
}

var https = require('https');
var console = require('console');

function https_request(authToken, method, path, data, callback)
{
    console.log('Request Data: %s', data);

    var post_options = {
        host: _API.host,
        port: _API.port,
        path: _API.path + path,
        method: method,
        headers: {
            'Authorization': 'Bearer ' + authToken,
            'Content-Type': 'application/json',
            'User-Agent': 'IoT.js',
            'Accept': 'application/json',
        },
        /* WARNING VERY-VERY unsafe! */
        rejectUnauthorized: false,
    };

    if (data) {
        post_options.headers['Content-Length'] = data.length;
    }

    console.log('Request Infos: %s' , JSON.stringify(post_options));
    console.log('Request Data: ' + data);
    var request = https.request(post_options, function (response) {
        var status_code = response.statusCode;
        var response_data = [];
        response.on('data', function (chunk) { response_data.push(chunk.toString()); });
        response.on('end', function () {
            console.log('RAW response(%s): %s', status_code, response_data);
            var json_data;
            try {
                json_data = JSON.parse(response_data.join(''));
            } catch (e) {
                console.log('Failed to convert response to JSON');
                return;
            }

            callback(json_data, status_code);
        });
    });

    if (data) {
        request.write(data);
    }
    request.end();
}

/* options = { appName, displayName, targetUrl, description, token } */
exports.register_webhook = function(options, callback)
{
    assert.assert(options.appName, 'No appName specified');
    assert.assert(options.displayName, 'No displayName specified');
    assert.assert(options.targetUrl, 'No targetUrl specified');

    var data = JSON.stringify({
        appName: options.appName,
        displayName: options.displayName,
        appType: 'WEBHOOK_SMART_APP',
        description: options.description || options.displayName,
        singleInstance: false,
        webhookSmartApp: {
            targetUrl: options.targetUrl,
        }
    });

    https_request(options.authToken, 'POST', '/apps', data, callback);
};

exports.app_list = function(options, callback)
{
    https_request(options.authToken, 'GET', '/apps', '', callback);
};

exports.app_delete = function(options, callback)
{
    https_request(options.authToken, 'DELETE', '/apps/' + options.appName, '', callback);
};

exports.app_get = function(options, callback)
{
    https_request(options.authToken, 'GET', '/apps/' + options.appName, '', callback);
};

exports.app_getoauth = function(options, callback)
{
    https_request(options.authToken, 'GET', '/apps/' + options.appName + '/oauth', '', callback);
};


exports.app_updateoauth = function(options, data, callback)
{
    https_request(options.authToken, 'PUT', '/apps/' + options.appName + '/oauth', JSON.stringify(data), callback);
};

exports.deviceprofile_list = function(options, callback)
{
    https_request(options.authToken, 'GET', '/deviceprofiles', '', callback);
};

exports.deviceprofile_create = function(options, profileData, callback)
{
    https_request(options.authToken, 'POST', '/deviceprofiles', JSON.stringify(profileData), callback);
};

exports.deviceprofile_delete = function(options, profileId, callback)
{
    https_request(options.authToken, 'DELETE', '/deviceprofiles/' + profileId, '', callback);
};

exports.device_list = function(options, callback)
{
    https_request(options.authToken, 'GET', '/devices/', '', callback);
};

exports.device_install = function(options, deviceData, callback)
{
    https_request(options.authToken, 'POST', '/devices', JSON.stringify(deviceData), callback);
};

exports.device_command = function(options, deviceData, callback)
{
    https_request(options.authToken, 'POST',
                  '/devices/' + options.deviceId + '/commands',
                  JSON.stringify(deviceData), callback);
};

exports.installedapps_list = function(options, callback)
{
    https_request(options.authToken, 'GET', '/installedapps/', '', callback);
};

exports.installedapps_delete = function(options, callback)
{
    https_request(options.authToken, 'DELETE', '/installedapps/' + options.installedAppId, '', callback);
};

exports.installedapps_configs = function(options, callback)
{
    https_request(options.authToken, 'GET', '/installedapps/' + options.installedAppId + '/configs', '', callback);
};

exports.installedapps_config = function(options, callback)
{
    https_request(options.authToken, 'GET',
                  '/installedapps/' + options.installedAppId + '/configs/' + options.configurationId,
                  '', callback);
};

exports.installedapps_post = function(options, appData, callback)
{
    https_request(options.authToken, 'POST', '/installedapps', JSON.stringify(appData), callback);
};


exports.locations_list = function(options, callback)
{
    https_request(options.authToken, 'GET', '/locations', '', callback);
}


exports.schedules_list = function(options, callback)
{
    https_request(options.authToken, 'GET',
                  '/installedapps/' + options.installedAppId + '/schedules', '', callback);
};

exports.schedules_add = function(options, data, callback)
{
    https_request(options.authToken, 'POST',
                  '/installedapps/' + options.installedAppId + '/schedules', JSON.stringify(data), callback);
};
