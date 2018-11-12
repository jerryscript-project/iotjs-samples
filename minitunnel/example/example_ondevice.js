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
var ReverseHTTPServer = require('reversehttp').ReverseHTTPServer;

var options = {
    shouldOpenNew: true,
    connectionLimit: 4,

    useSSL: true,
    ca: fs.readFileSync('server-ca-cert.crt'),
    // TODO: make sure this can be set to true
    rejectUnauthorized: false,
};
var counter = 1;

var testServer = new ReverseHTTPServer(options, function(req, resp) {
    console.log(req.url);

    if (req.url === '/') {
        var contents = "<h1> DEMO " + counter++  + "</h1>";

        resp.setHeader('Content-Length', contents.length);
        resp.setHeader('Content-Type', 'text/html');
        resp.setHeader('Connection', 'close');

        resp.writeHead(200);
        resp.write(contents);
        resp.write('');
    }
    resp.end();
});

testServer.on('connection', function(socket) {
    console.log('New connection to TUN ID: ' + socket._id);
});
testServer.on('clientClose', function(socket) {
    console.log('Closing connection to TUN ID: ' + socket._id);
});
testServer.on('timeout', function(socket) {
    console.log('Timeout on connection ID: ' + socket._id);
});
testServer.on('error', function(socket) {
    console.log('Error on connection ID: ' + socket._id);
});
testServer.on('data', function(socket, data) {
    console.log('INP: ');
    console.log(data.toString());
});

testServer.requestTunnel('https://localhost:8889', function(tunnel_info) {
   console.log('Registered tunnel: ' + JSON.stringify(tunnel_info));
   testServer.listen(tunnel_info.remote_port, tunnel_info.remote_host);

   console.log('Use: https://localhost:8889' + tunnel_info.url);
});

