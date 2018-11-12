var console = require('console');
var tun = require('tunnelserver');
var fs = require('fs');

//var manager = new tun.ClientManager();

var proxyServer = new tun.PublicProxyServer({
  //  manager: manager,

    useSSL: true,
    key: fs.readFileSync('server-key.key'),
    cert: fs.readFileSync('server-cert.crt'),
    // TODO: make sure this can be set to true
    rejectUnauthorized: false,
});
proxyServer.on('error', function() {
    console.log("GOT ERROR: ");
    console.log(JSON.stringify(arguments));
});
proxyServer.on('newClient', function(client_info) {
    console.log('Registered new client: ' + JSON.stringify(client_info));
});
proxyServer.on('connectClient', function(client_info) {
    console.log('Connection from client: ' + JSON.stringify(client_info));
});
proxyServer.on('rawRequest', function(request, response) {
    console.log('RAW New Request: ' + request.url);
});

proxyServer.on('statsRequest', function(request, response) {
});

proxyServer.on('request', function(targetSocket, request, response) {
    console.log('New Public Request: ' + request.url);
});
proxyServer.on('publicData', function(targetSocket, request, data) {
    console.log('DATA: PUBLIC -> PRIVATE');
    console.log(data);
    console.log('--->');
});
proxyServer.on('privateData', function(targetSocket, response, data) {
    console.log('DATA: PRIVATE -> PUBLIC');
    console.log(data);
    console.log('<---');
});
proxyServer.on('close', function(targetSocket) {
    console.log('Closing public request');
});

proxyServer.listen(8889, function() {
    console.log('Running proxy server 8889');
});
