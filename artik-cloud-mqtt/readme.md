# IoT.js MQTT Artik cloud demo
This short demo demonstrates a connection to the `api.artik.cloud` server through an SSL connection.

## Step 1 - Initial setup
Register a new account on `https://developer.artik.cloud/` and sign in.
Build IoT.js with MQTT and TLS enabled (`--cmake-param=-DENABLE_MODULE_MQTT=1 --cmake-param=-DENABLE_MODULE_TLS=1`).
## Step 2 - Registering your device
When signed in click on the `Devices` button. This will navigate you to the section where you can manage your devices.
Add a new device clicking on `Add Another device...`
Select a corresponding device, or if you don't find anything suitable you can create your own type of device, by clicking on the `Developers` button in the top right corner.
Having clicked the button you will see a `Dashboard` where you can see `Device types` and you can click on `+ New` to create a new type of device.
Select a display name and a unique name for your device. The unique name must be in the format `com.your_company.devicename`. Having that done, you can continue, and you will be redirected to the next page where you can set your device up. After selecting the correct device, you should give it a name and you are all set.
## Step 3 - Filling in the credentials
Click on the device, and a popup will show up. You should generate a device token as it is needed for the authentication. This will be your `password` property in the MQTT options object.
Copy your `device ID` and `device token` to the corresponding values in the JS example file, generate a client certificate and a private key for example with `OpenSSL`, and also set it in the JS file.
## Additional information
According to the documentation the data you send must be `JSON.stringify`-d, and should be in the following format:

```js
var data = {
  "property_name": property_value,
   ...
};
```

Only one MQTT client can be connected with the same `device id` simultaneously.
A client can `publish` and/or `subscribe` to a topic.
