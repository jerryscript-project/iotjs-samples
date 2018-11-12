# API: Reverse HTTP

# class ReverseHTTPServer

The class represents a reverse HTTP server which connects to
a Tunnel Server and opens multiple network connections
to it. On each connection it is waiting for data
which will be processed as a HTTP request.

## new ReverseHTTPServer([options], callback)

* `options` {Object} Options for the server.
  * `connectionLimit` {integer} Maximum number of simultaneous tunnel connections to the Tunnel Server (default: `10`).
  * `useSSL` {boolean} If `true` the tunnel will use SSL connections. (default: `false`)
  * Other options from `https.Server`.
* `callback` {Function} Callback used for the `request` event.

**Example**

```js
var options = {
    useSSL: true,
    ca: fs.readFileSync('server-ca-cert.crt'),
    rejectUnauthorized: false,
};
var counter = 1;

var srv = new ReverseHTTPServer(options, function(req, resp) {
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

srv.requestTunnel("http://localhost:8889", function(tunnel) {
  srv.listen(tunnel.remote_port, tunnel.remote_host);
  console.log('Use: https://localhost:8889' + tunnel_info.url);
});
```

## Events

### clientClose
Event argument:
* `socket` {net.Socket} The socket which was closed.

Triggered when the underlying socket which is connected to the Tunnel Server is closed.

### clientError
Event arguments:
* `socket` {net.Socket} The underlying socket which triggered the error.
* `error ` {Error} The error object.

Event triggered when there is any error on an underlying socket.

### data
Event argument:
* `chunk` {Buffer} Chunk of data received from the underlying socket.

**NOTE**: This event is a low level interface for the underlying sockets.
Usually there is no need to handle this event.

Event triggered when there is any data received from the Tunnel Server.

### request
Event arguments:
* `request` {http.IncomingMessage} Represents the HTTP request sent by the client.
* `response` {http.ServerResponse} Represents the HTTP response which will be sent by the server.

After HTTP request headers are parsed, the 'request' event will be fired.
This event is triggered for each incoming HTTP request.

**Example**

```js
var srv = new ReverseHTTPServer();
srv.on('request', function(request, response) {
  //...
});
//...
```

### tunnelConnected
Event arguments:
* `tunnel` {Object} Tunnel information object returned from the Tunnel Server.
  * `remote_host` {string} The domain this server should connect to use the tunnel.
  * `remote_port` {number} The port this server should connect to use the tunnel.
  * `url` {string} Endpoint url used to connect to this server on the Tunnel Server.
  * `name` {string} Unique tunnel identifier.
  * `max_conn` {number} Maximum number of tunnel connections.

Event triggered when the `reverseHTTPServer.requestTunnel` successfuly registers
a tunnel on the Tunnel Server. After this event triggered the tunnel can be opened
via the `reverseHTTPServer.listen` method using the `remote_host` and `remote_port`
information.

**Example**

```js
var srv = new ReverseHTTPServer();
//...
srv.on('tunnelConnected', function(tunnel) {
  srv.listen(tunnel.remote_port, tunnel.remote_host);
  console.log('Use: https://localhost:8889' + tunnel_info.url);
});
srv.requestTunnel("http://localhost:8889");
```


## Methods

### reverseHTTPServer.requestTunnel(server_url[, callback])
Method arguments:
* `server_url`
* `callback`

related event:
* `tunnelConnected`

**Example**

```js
var srv = new ReverseHTTPServer();
//...
srv.requestTunnel("http://localhost:8889", function(tunnel) {
  srv.listen(tunnel.remote_port, tunnel.remote_host);
  console.log('Use: https://localhost:8889' + tunnel_info.url);
});
```

### reverseHTTPServer.listen(port, host)
Method arguments:
* `port` {number} Port to use when connecting to the Tunnel Server.
* `host` {string} Host where the Tunnel Server is.

The method creates connections to the Tunnel Server specified the arguments.

