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
var EventEmitter = EventEmitter = require('events').EventEmitter;
var util = require('util');


function TunnelClient(server_options, listen_callback) {
    EventEmitter.call(this);

    this.connections = [];
    this.currentIdx = 0;
    this.local_port = -1;
    this._server_options = server_options;

    if (server_options.useSSL === true) {
        transport = require('tls');
    } else {
        transport = require('net');
    }

    this._server = transport.createServer(server_options, this._listen_client.bind(this));
    this._listen_callback = listen_callback;
};

util.inherits(TunnelClient, EventEmitter);

TunnelClient.prototype._listen_client = function(socket) {
    this.addConnection(socket);

    var client = this;
    socket.on('close', function() {
        socket._noadd = true;
        client.removeConnection(socket);
        client.emit('close', socket);
    });

    this.emit('connect', socket);
};

TunnelClient.prototype.listen = function(port) {
    this.local_port = port;
    this._server.listen(this.local_port, this._listen_callback);
};

TunnelClient.prototype.addConnection = function(socket) {
    if (socket._noadd === false) {
        return;
    }

    this.connections.push(socket);
};

TunnelClient.prototype.removeConnection = function(socket) {
    var idx = this.connections.indexOf(socket);

    if (idx !== -1) {
        this.connections.splice(idx, 1);
    }
};

TunnelClient.prototype.getNextConnection = function() {
    if (this.connections.length === 0) {
        return null;
    }

    var idx = this.currentIdx;
    do {
        var currentIdx = idx++ % this.connections.length;
        var target = this.connections[currentIdx];
    } while (target._noadd === false);
    this.currentIdx = idx;

    return target;
};



function ClientManager(server_options) {
    this._clients = {};
    this.clientId = 1;
    this._server_options = server_options || {};
};

ClientManager.prototype.hasClient = function(client_key) {
    return client_key in this._clients;
};

ClientManager.prototype.newClient = function(client_key, port, listen_callback) {
    if (this.hasClient(client_key)) {
        return null;
    }

    var client = new TunnelClient(this._server_options, listen_callback);
    this._clients[client_key] = client;
    client.listen(port);
    return client;
};

ClientManager.prototype.add = function(client_key, socket) {
    if (socket._noadd === false){
        return null;
    }

    if (!this.hasClient(client_key)) {
        return null;
    }

    this._clients[client_key].addConnection(socket);
};

ClientManager.prototype.remove = function(client_key, socket) {
    if (!this.hasClient(client_key)) {
        return;
    }

    this._clients[client_key].removeConnection(socket);
};

ClientManager.prototype.getSocket = function(client_key) {
    if (!this.hasClient(client_key)) {
        return null;
    }

    var client = this._clients[client_key];
    return client.getNextConnection();
};


function PublicProxyServer(options) {
    EventEmitter.call(this);

    if (options.manager instanceof ClientManager) {
        this._manager = options.manager;
    } else {
        this._manager = new ClientManager(options);
    }

    if (options.useSSL === true) {
        var https = require('https');
        this._server = https.createServer(options, this._http_handler.bind(this));
    } else {
        var http = require('http');
        this._server = http.createServer(/*options,*/this._http_handler.bind(this));
    }
    this._port_start = 9001;
    this._port_end = 9999;
    this._port_next = this._port_start;
};

util.inherits(PublicProxyServer, EventEmitter);

PublicProxyServer.prototype._getNextClientPort = function() {
    var port = this._port_next;
    do {
        port++;
        port = Math.max(this._port_start, port % this._port_end);
    } while (this._manager.hasClient(port));
    this._port_next = port;

    return port;
};

PublicProxyServer.prototype._getTarget = function(request) {
    // TODO: handle more domains
    // url:  /d/<id>/
    // TODO: check url format

    var id = parseInt(request.url.substr(3));
    var target_socket = this._manager.getSocket(id);
    return target_socket;
};

PublicProxyServer.prototype.listen = function(port, callback) {
    this._server.listen(port, callback);
};

PublicProxyServer.prototype._http_handler = function(request, response) {
    this.emit('rawRequest', request, response);
    switch (request.url) {
        case '/api/new': {
            this._handle_new_connection(request, response);
            break;
        }
        case '/api/stats': {
            this.emit('statsRequest', request, response);
            break;
        }
        default: {
            if (request.url.substr(0, 3) === '/d/') {
                this._handle_proxy(request, response);
            } else {
                response.statusCode = 400;
                response.end('INVALID REQUEST');
                this.emit('error', 'Invalid REQ');
            }
            break;
        }
    }
};

PublicProxyServer.prototype._handle_new_connection = function(request, response) {
    var publicServer = this;

    /* Do some sanity checks */
    if (request.method !== 'GET') {
        response.statusCode = 400;
        response.end('INVALID REQUEST: method mismatch');
        return;
    }

    /* Client connected with correct url and method.
     * generate an ID and return some config info.
     */
    var client_port = this._getNextClientPort();
    var new_client_info = {
        /* TODO: correctly detect/get the remote_host */
        remote_host: '127.0.0.1',
        remote_port: client_port,
        name: "p" + client_port,
        url: "/d/" + client_port,
        max_conn: 4,
    };

    var client = this._manager.newClient(client_port, client_port, function() {
        publicServer.emit('newClient', new_client_info);
    });

    client.on('connect', function() {
        publicServer.emit('connectClient', new_client_info);
    });

    var response_data = JSON.stringify(new_client_info);
    response.setHeader('Content-Length', response_data.length);
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('X-Powered-By', 'MinItunnel');
    response.statusCode = 200;
    response.writeHead(200);
    response.write(response_data);
    response.end();
};

PublicProxyServer.prototype._handle_proxy = function(request, response) {
    var publicServer = this;
    /* Select client to use */
    var target = publicServer._getTarget(request);

    if (target === null) {
        response.statusCode = 400;
        response.end('INVALID REQUEST');
        publicServer.emit('error', 'No client Found');
        return;
    }

    publicServer.emit('request', target, request, response);

    // TODO: correct url check.
    var target_url = request.url.substr('/d/0000'.length);
    if (target_url.length === 0) {
        target_url = '/';
    }
    /* Reconstruct headers and forward data */
    target.write(request.method.toUpperCase() + ' ' + target_url + ' HTTP/1.1\r\n');

    var headers = request.headers;
    for (var name in headers) {
        target.write(name + ': ' + headers[name] + '\r\n');
    }
    target.write('\r\n');

    function requestDataProcess(data) {
        publicServer.emit('publicData', target, request, data);
        target.write(data);
    }

    function responseDataProcess(data) {
        publicServer.emit('privateData', target, response, data);
        response.socket.write(data);
    }

    function closeRequestResponseProcess() {
        response.end();
        publicServer.emit('close', target)
        target.removeListener('data', responseDataProcess);
    }

    request.on('data', requestDataProcess);
    target.on('data', responseDataProcess);

    request.on('close', closeRequestResponseProcess);
    response.on('close', closeRequestResponseProcess);
};


exports.ClientManager = ClientManager;
exports.PublicProxyServer = PublicProxyServer;
