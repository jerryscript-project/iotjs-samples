# Sample bridge module

See also:
* [Writing-new-module](https://github.com/Samsung/iotjs/blob/master/docs/devs/Writing-New-Module.md)
* [Native Module vs. JS module](https://github.com/Samsung/iotjs/blob/master/docs/devs/Native-Module-vs-JS-Module.md)
* [Inside IoT.js](https://github.com/Samsung/iotjs/blob/master/docs/devs/Inside-IoT.js.md)
* [Developer Tutorial](https://github.com/Samsung/iotjs/blob/master/docs/devs/Developer-Tutorial.md)


## Description
This sample show you how you can create a 'mixed' module using brige module that has some interfaces to support communicattion between JS and Native code. This sample created using tools/iotjs-create-module.py script.
You can see how you could reduce your effor to create native module using simple methods provided bridge module.


## Build

$ ./tools/build.py --external-modules=./samples/bridge_sample --cmake-param=-DENABLE_MODULE_BRIDGE_SAMPLE=ON

## Testing

$ iotjs samples/bridge_sample/test.js
