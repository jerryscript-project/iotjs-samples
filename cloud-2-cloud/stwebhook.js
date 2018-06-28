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

/**
 * EXPERIMENTAL
 * Smart Application WebHook for Cloud-to-Cloud connection and Automation.
 */

var console = require('console');
var http = require('http');
var https = require('https');

/**
 * Constructor for STWebHook
 */
function STWebHook(options)
{
    if (typeof(this) !== "object") {
        throw new Error("STWebHook must be called with new");
    }

    if (!options) {
        options = {};
    }

    this.lifecycleTypes =
    [
        'PING',
        'CONFIGURATION',
        'INSTALL',
        'UPDATE',
        'UNINSTALL',
        'EVENT'
    ];
    this._handlers = {
        /* Ping handler is common, register it by default. */
        'PING': this._handle_ping,
    };

    /* Skip the PING handler, it is already registered. */
    for (var idx = 1; idx < this.lifecycleTypes.length; idx++) {
        this.handle(this.lifecycleTypes[idx], this._handle_log);
    }

    this._options = {
        'powered_by': options.powered_by || 'ST-IoT.js',
    };
};


/**
 * The 'handle' method registers a callback for a given 'messageType'.
 * The 'messageType' is one of the lifecycle events described in the
 * SmartThings documentation.
 *
 * 'callback' is a function with two parameters:
 *  * 'message' - the JSON request sent by the ST Cloud.
 *  * 'response' - the Response object to allow setting header information
 *  The 'callback' method *must* return a JS object with properties set
 *   as required for the given lifecycle event.
 */
STWebHook.prototype.handle = function(messageType, callback) {
    console.log('Registering callback for: %s', messageType);
    this._handlers[messageType.toUpperCase()] = callback;
};
/**
 * 'on' is an alias for the 'handle' method in the STWebHook.
 */
STWebHook.prototype.on = STWebHook.prototype.handle;

/**
 * Helper method to return a json result for a given 'response'.
 * Used internally and should not be overridden.
 */
STWebHook.prototype._json_reply = function(response, data) {
    var json_data = JSON.stringify(data);
    response.writeHead(200,
        {
            'Content-Type': 'application/json',
            'Content-Length': json_data.length,
            'X-Powered-By': this._options.powered_by,
        }
    );
    console.log('Sending JSON reply: %s', json_data);

    response.write(json_data);
    response.end();
};

/**
 * The default 'PING' lifecycle handler.
 *
 * Based on the documentation this should set the 'statusCode' and
 * 'pingData' in a response JSON.
 *
 * The 'pingData.challenge' is should be extracted from the
 * input 'message.pingData.challange' value.
 */
STWebHook.prototype._handle_ping = function(message, response) {
    console.log(' Running default "PING" handler with data:\n%s',
                JSON.stringify(message));
    return {
        statusCode: 200,
        pingData: { challenge: message.pingData.challenge }
    };
};

/**
 * Default lifecycle message handlers.
 *
 * This hander only present to be a convenient debugger function
 * to see what messages are sent by the Cloud.
 */
STWebHook.prototype._handle_log = function(message, response) {
    console.log(' Running default handler for "%s" lifecycle with data:\n%s',
                message.lifecycle, JSON.stringify(message));
    return {
        statusCode: 200,
        pingData: {},
        configurationData: {},
        installData: {},
        updateData: {},
        uninstallData: {},
        eventData: {},
    };
};

/**
 * The request handler whihc can be used in a http/https server.
 * It collects the input messages and calls the appropriate lifecycle
 * handler.
 */
STWebHook.prototype.request_handler = function(request, response) {
    var hook = this;
    console.log('Client Request: %s %s', request.method, request.url);
    var request_chunks = [];

    request.on('data', function (chunk) { request_chunks.push(chunk.toString()); });
    request.on('end', function () {
        var data = request_chunks.join('');
        console.log('Client Data: %s', data);

        var message = JSON.parse(data);
        var reply_message = hook._handlers[message.lifecycle](message, response);

        hook._json_reply(response, reply_message);
    });
};

exports.STWebHook = STWebHook;



function STWebHookServer(options, webhook) {
    if (typeof(this) !== "object") {
        throw new Error("STWebHookServer should be called with new.");
    }

    if (arguments.length != 2) {
        throw new Error("STWebHookServer requires two arguments.");
    }

    if (!options.targetUrl) {
        throw new Error("STWebHookServer expects a 'targetUrl' option.");
    }

    this._webhook = webhook;
    this._options = {
        serverType: options.serverType || 'http',
        localPort: options.localPort || 8889,
        targetUrl: options.targetUrl,
    };
};

STWebHookServer.prototype.createServer = function() {
    if (this._options.serverType === 'http') {
        var webhook = this._webhook;
        this._server = http.createServer(function (request, response) {
            webhook.request_handler(request, response);
        });
    } else if (this._options.serverType === 'https') {
        throw new Error("Unimplemented https server mode");
    } else {
        throw new Error("StWebHookServer invalid serverType: " + this._options.serverType);
    }
};

STWebHookServer.prototype.listen = function() {
    console.log("Started STWebHookServer listening on port :", this._options.localPort)
    this._server.listen(this._options.localPort);
};

exports.STWebHookServer = STWebHookServer;
