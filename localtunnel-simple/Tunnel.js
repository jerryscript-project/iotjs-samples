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
 * Based on the project: https://github.com/localtunnel/localtunnel
 *
 * MIT License
 *
 * Copyright (c) 2018 Roman Shtylman
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var net = require('net');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var TunnelCluster = require('./TunnelCluster');

var _URLPattern = new RegExp('http(s)?://([\\w.-]+)(?::(\\d+))?');

function Tunnel(options) {
    if (!(this instanceof Tunnel)) {
        return new Tunnel(options);
    }

    this._opt = options;
    this._opt.host = this._opt.host || 'https://localtunnel.me';
};

util.inherits(Tunnel, EventEmitter);

Tunnel.prototype.open = function(callback) {
    var self = this;
    self._init(function(err, info) {
        if (err) {
            return callback(err);
        }

        self.url = info.url;
        self._estabilish(info);
        callback();
    });
};

// Connect to tunnel server and request a tunnel.
Tunnel.prototype._init = function(callback) {
    var opt = this._opt;
    var url = _URLPattern.exec(opt.host);
    if (!url) {
        return callback(new Error('Invalid Tunnel Host url'));
    };

    var port = url[3] || ((url[1] === 's') ? 443 : 80);
    var requestParams = {
        'host': url[2],
        'method': 'GET',
        'path': '/?new',
        'port': 80,
        'headers': {
            'Accept': 'application/json',
            'User-Agent': 'IoT.js',
            'Connection': 'close',
        },
    };

    var request = http.request(requestParams, function(response) {
        var status = response.statusCode;
        var responseData = [];
        response.on('data', function (chunk) { responseData.push(chunk.toString()); });
        response.on('end', function () {
            if (status !== 200) {
                return callback(new Error('Error from Tunnel server: ' + status));
            }

            // console.log('RAW response(%s): %s', status, responseData);
            var jsonData;
            try {
                jsonData = JSON.parse(responseData.join(''));
            } catch (e) {
                return callback(new Error('Invalid data format from Tunnel server'));
            }

            var tunnelInfo = {
                remote_host: url[2],
                remote_port: jsonData.port,
                url: jsonData.url,
                name: jsonData.id,
                max_conn: jsonData.max_conn_count || 2,
            };
            return callback(null, tunnelInfo);
        });

    });
    request.end();
};

Tunnel.prototype._establish = function(info) {
    var self = this;
    var opt = self._opt;

    info.local_host = opt.local_host;
    info.local_port = opt.port;

    var tunnels = self.tunnel_cluster = TunnelCluster(info);

    // only emit the url the first time
    tunnels.once('open', function() {
        self.emit('url', info.url);
    });

    // re-emit socket error
    tunnels.on('error', function(err) {
        self.emit('error', err);
    });

    var tunnel_count = 0;

    // track open count
    tunnels.on('open', function(tunnel) {
        tunnel_count++;
        console.log('tunnel open [total: %d]', tunnel_count);

        var close_handler = function() {
            tunnel.destroy();
        };

        if (self._closed) {
            return close_handler();
        }

        self.once('close', close_handler);
        tunnel.once('close', function() {
            self.removeListener('close', close_handler);
        });
    });

    // when a tunnel dies, open a new one
    tunnels.on('dead', function(tunnel) {
        tunnel_count--;
        console.log('tunnel dead [total: %d]', tunnel_count);

        if (self._closed) {
            return;
        }

        tunnels.open();
    });

    tunnels.on('request', function(info) {
        self.emit('request', info);
    });

    // establish as many tunnels as allowed
    for (var count = 0 ; count < info.max_conn ; ++count) {
        tunnels.open();
    }
};

Tunnel.prototype.open = function(cb) {
    var self = this;

    self._init(function(err, info) {
        if (err) {
            return cb(err);
        }

        self.url = info.url;
        self._establish(info);
        cb();
    });
};

// shutdown tunnels
Tunnel.prototype.close = function() {
    var self = this;

    self._closed = true;
    self.emit('close');
};

module.exports = Tunnel;
