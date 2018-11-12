# MiniTunnel

## To run the Mini Tunnel server

```
IOTJS_EXTRA_MODULE_PATH=./lib ../iotjs/build/x86_64-linux/debug/bin/iotjs example/example_tunserver.js
```

## To run the Client for the server
```
IOTJS_EXTRA_MODULE_PATH=./lib ../iotjs/build/x86_64-linux/debug/bin/iotjs example/example_ondevice.js
```


# Notes

* **Do not** use the attached certificates in production envirionment.
* Enable the SSL mode for both server and client parts in production environment.
