# API: Tunnel Server

# class PublicProxyServer

The class implements a Tunnel Server where all
public connections to a given url path is forwarded to
a uniquely identifiable Tunnel client.

To register a client in the server one should issue a
HTTP `GET` request to the `/api/new` path. On success this
will return a set of client information for the client and
register the same information internally. Each client
receives a unique id which should be used by public
connections to access the target client via the Tunnel Server.

To access a registered client via the Tunnel Server
one should issue the required HTTP request to the
Tunnel Server using the `/d/(id)/` path as the prefix for
the request url.

## new PublicProxyServer(options)

* `options` {object} Options for the Server.
  * `useSSL` {boolean} Runs the server using SSL connections (default: `false`). Enabling this will require `key` and `cert` options.
  * Other options from `https.Server`.

The Public Proxy Server acts as a Tunnel server for the connected clients.

**NOTE**: For security considerations the `useSSL` options should be used with a valid certificate.

**Example**

```js
var console = require('console');
var tun = require('tunnelserver');
var fs = require('fs');

var proxyServer = new tun.PublicProxyServer({
    useSSL: true,
    key: fs.readFileSync('server-key.key'),
    cert: fs.readFileSync('server-cert.crt'),
    rejectUnauthorized: false,
});

proxyServer.listen(8889, function() {
  console.log('Running proxy server 8889');
});
```

## Events

## error

Event argument:
* `reason` {string} The reason for the error.

Triggered when an incorrect request is received by the server or
a client is connected without registering correctly.

## newClient

Event argument:
* `client_info` {Object}
  * `remote_host` {string}
  * `remote_port` {number} Port number where the tunnel client can connect to.
  * `name` {string} Unique identifier of the registered client.
  * `url` {string} Unique path usable publicly to send requests for the tunnel client.
  * `max_conn` {number} Maximum number of simultaneous tunnel connections between the client and tunnel server.

Event triggered when a new client successfully requested a tunnel. Then `client_info` object
will also be sent to the client.

## connectClient

Event argument:
* `client_info` {Object}
  * `remote_host` {string}
  * `remote_port` {number} Port number where the tunnel client can connect to.
  * `name` {string} Unique identifier of the registered client.
  * `url` {string} Unique path usable publicly to send requests for the tunnel client.
  * `max_conn` {number} Maximum number of simultaneous tunnel connections between the client and tunnel server.

Triggered when the registered client creates a tunnel connection. This event will be invoked
multiple times.

## Methods

### publicProxyServer.listen(port[, callback])

* `port` {number} Port number on which the server should listen.
* `callback` {Function} Callback function invoked when the server starts listening on the port.

The method starts the Tunnel Server, all of it's underlying components and will listen on the
specified `port` number for connections.
