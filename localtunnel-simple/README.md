# LocalTunnel.me demo

This demo creates a tunnel via the LocalTunnel.me service.

**NOTE**: the communication between the LocalTunnel.me service and the client
is done over HTTP thus it is not secure!

## How to test?

0. A minimal configuration of the example can be seen in the `test_localtunnel.js` file.
   The `opt` object contains the relevant configuration for the tunnel service.
   One important information is the `port` value (which is set to `8800` by default) and
   the `local_host` value. The `local_host` value specifies the target domain where the requests
   should be forwarded to.

   By default all requests will be sent to the `localhost:8800` address.

1. Before running the `test_localtunnel.js` script make sure there is a HTTP server accessible
   on the `localhost:8800` address.

   If there is no such server, there is a provided example http server named `test_welcome_server.js`.
   This server can be started via node.js or IoT.js and will log all requests.
   To start this server execute the following command:
   ```
    $ iotjs test_welcome_server.js
   ```

   This will act as an "internal" server.

2. After there is a HTTP service running on the `localhost:8800` address. The tunnel can be started.
   Execute the following command:
   ```
    $ iotjs test_localtunnel.js
   ```

   To access the "internal" server look for the `Your url is` line in the output.
   Using the given url one can access the server via the LocalTunnel service.

