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

var EventEmitter = EventEmitter = require('events').EventEmitter;
var http = require('http');
var net = require('net');
var util = require('util');
var http_server;
if (process.iotjs) {
    http_server = require('http_server');
} else {
    http_server = require('_http_server');
    http_server.connectionListener = http_server._connectionListener;
}


function ReverseHTTPServer(options, request_callback) {
    EventEmitter.call(this);
    this.timeout = 30 * 1000;
    this._connectionLimit = 10;
    this._connectionsList = []
    this._socketCounter = 1;
    this._shouldOpenNew = false;
    this._isclosing = false;

    if (util.isFunction(options)) {
        this._request_callback = options;
    } else {
        this._shouldOpenNew = options.shouldOpenNew;
        this._connectionLimit = options.connectionLimit;
        this._request_callback = request_callback;
        this._options = options;
    }

    this._transport = require((options.useSSL === true) ? 'tls' : 'net');

    var server = this;

    this.on('request', function(request, response) {
        server._request_callback(request, response);
        if (server._shouldOpenNew && !response.finished) {
            response.end();
        }
    });
    this.on('clientClose', function(socket) {
        if (server._shouldOpenNew && !server._isclosing) {
            server._createSockets(1);
        }
    });
    this.on('clientError', function(e, socket) {
        server._shouldOpenNew = false;
    });

    this._IncomingMessage = options.IncomingMessage || http.IncomingMessage;
    this._ServerResponse = options.ServerResponse || http.ServerResponse;

    if (!process.iotjs) {
        this[http_server.kIncomingMessage] = this._IncomingMessage;
        this[http_server.kServerResponse] = this._ServerResponse;
    }
};

// Server inherits EventEmitter.
util.inherits(ReverseHTTPServer, EventEmitter);

ReverseHTTPServer.prototype._emitCloseIfDrained = net.Server.prototype._emitCloseIfDrained;

ReverseHTTPServer.prototype.requestTunnel = function(server_url, callback) {
    var server = this;
    var srv;
    var port;

    // TODO: improve url parsing
    var parts = server_url.split('//');
    var protocol = parts[0];

    if (protocol === 'https:') {
        srv = require('https');
        port = 443;
    } else if (protocol === 'http:') {
        srv = http;
        port = 80;
    } else {
        throw new Error("Incorrect server url: " + server_url);
    }

    var port_start = parts[1].indexOf(':');

    if (port_start !== -1) {
        port = parseInt(parts[1].substr(port_start + 1));
    }

    var tunnel_domain = parts[1].substr(0, port_start);

    if (callback) {
        server.on('tunnelConnected', callback);
    }
    var get_options = {
        port: port,
        host: tunnel_domain,
        path: '/api/new',

        ca: server._options.ca,
    };

    var get = srv.get(get_options, function(response) {
        var data = []
        response.on('data', function(chunk) {
            data.push(chunk);
        }).on('end', function() {
            var body = Buffer.concat(data).toString();
            server._tunnel_data = JSON.parse(body);
            server._tunnel_data.remote_host = tunnel_domain;

            server.emit('tunnelConnected', server._tunnel_data);
        });
    });
};

ReverseHTTPServer.prototype.listen = function(port, host) {
    this._target = { host: host, port: port };
    this._createSockets();
};

ReverseHTTPServer.prototype._createSockets = function(connection_count) {
    var limit = connection_count || this._connectionLimit;
    for (var idx = 0; idx < limit; idx++) {
        console.log(idx);
        var new_socket = this._transport.connect(this._target.port, this._target.host, this._options);
        new_socket.setTimeout(this.timeout);
        this._addSocket(new_socket);
    }
};

ReverseHTTPServer.prototype._removeSocket = function(socket) {
    var idx = this._connectionsList.indexOf(socket);

    if (idx !== -1) {
        this._connectionsList.splice(socket, 1);
    }
};

ReverseHTTPServer.prototype._addSocket = function (socket) {
    var server = this;
    var socketIdx = this._socketCounter++;
    var event_type = (this._options.useSSL === true) ? 'secureConnect' : 'connect';
    socket._id = socketIdx;

    socket.on(event_type, function() {
        socket._server = server;
        http_server.connectionListener.call(server, socket);
        server.emit('connection', socket);

        socket.on('data', function(data) {
            server.emit('data', socket, data);
        });
        socket.on('close', function() {
            server._removeSocket(socket);
            server.emit('clientClose', socket);
        });
        socket.on('timeout', function() {
            server._removeSocket(socket);
            server.emit('timeout', socket);
        });
        socket.on('error', function(e){
            server.emit('clientError', e, socket);
        });
    });


    this._connectionsList.push(socket);
};

ReverseHTTPServer.prototype.close = function() {
    this._isclosing = true;
    for (var idx in this._connectionsList.length) {
        var socket = this._connectionsList[idx];
        socket.close();
    }
    this._connectionsList.splice(0, this._connectionsList.length);
    this._isclosing = false;
};

exports.ReverseHTTPServer = ReverseHTTPServer;
