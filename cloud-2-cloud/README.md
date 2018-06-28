# Demo Cloud-to-Cloud connector

The example creates a C2C connector which creates a new device with
`switchLevel` capability and a schedules timer events in every 5 minutes.

## How to use?

1. Create a personal token at the [https://account.smartthings.com/tokens] page.
   For this demo you should select all of the scopes. Please note down the
   authentication token as it will be required below as the `authToken`.

2. Create an `ngrok` http tunnel for a custom port.
   For example:
   ```
    $ ngrok http 8889
   ```
   There will be a `Forwarding https://.....ngrok.io` entry from which the
   https url is required, please note this down.

3. Create a JSON file named `local_config.json` with the following contents:
   ```
   {
    "appName": "....",
    "displayName": "....",
    "targetUrl": "https://....",
    "localPort": 8889,
    "authToken": "..."
   }
   ```

   Info about the keys:
   * `appName` - the name of the app, must be a globally unique (do *not* use upper case letters!)
   * `displayName` - the name which will be displayed.
   * `targetUrl` - the publicly accessible url by the ST cloud, must be a https url!
   * `localPort` - the local port on which the application should listen,
   * `authToken` - the authToken issued by the https://account.smartthings.com/tokens page.

4. Start the `app.js`. This will create a Cloud-to-Cloud connector. Do not close this terminal.
   ```
    $ iotjs app.js
   ```

5. In another terminal run the `appRegister.js`.
   ```
    $ iotjs appRegister.js
   ```
   This command will register the previously started Cloud-to-Cloud connector. There should be
   a PING activity in the previous terminal. Additionally a device profile is also created.
   To see what was returned by the Cloud please see the `result_appdeviceprofile.json` and
   the `result_appprofile.json` files. Do *not* delete these new files.

6. Install the C2C connector application in the SmartThings Android application.
   For this maybe the old Android application should be used.

7. After a successful installation the C2C connector should install its own
   device. This device has one capability: `switchLevel`.

8. To send a command to the device please use the `trigger_device.js` application.
   This application will send a new random switchLevel value for the installed device.
   The new value arrives for the C2C connector as an `EVENT` lifecycle with `DEVICE_EVENT` type.
   All events are printed out by the C2C connector.


9. If the application is no longer needed it is possible to uninstall it.
   For this please extract the `installedAppId` from the `result_appinstallconfig.json` file and
   execute the following command:
   ```
    $ iotjs cmds installedapps_delete <installedAppId>
   ```
   This will remove the registered timer(s) also.
