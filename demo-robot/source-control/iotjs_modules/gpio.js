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

var fs = require('fs'),
    GPIO_FILE_PATH = './gpio_#PIN#.txt';

function native(configuration, callback) {
  this.pin = configuration.pin || 0;
  this.direction = configuration.direction || 0;
  this.mode = configuration.mode || 0;
  this.value = 0;
  this.filePath = GPIO_FILE_PATH.replace('#PIN#', this.pin);

  if (callback) {
    this.write(this.value, callback); // create the file
  } else {
    this.writeSync(this.value);
  }

  if (this.direction === native.DIRECTION.OUT) {
    console.log('GPIO MOCK: opening pin ' + this.pin +
    ' for writing, path is ' + this.filePath);
  } else if (typeof callback === 'function') {
    console.log('GPIO MOCK: opening pin ' + this.pin +
    ' for reading, path is ' + this.filePath);
  }
}

native.DIRECTION = {
  IN: 0,
  OUT: 1,
};

native.MODE = {
  NONE: 2,
  PULLUP: 3,
  PULLDOWN: 4,
  FLOAT: 5,
  PUSHPULL: 6,
  OPENDRAIN: 7,
};

native.prototype = {
  write: function(value, callback) {
    this.value = value;
    fs.writeFile(this.filePath, '' + value, callback);
  },

  writeSync: function(value) {
    this.value = value;
    fs.writeFileSync(this.filePath, value);
  },

  read: function(callback) {
    fs.readFile(this.filePath, function(err, data) {
      if (err) {
        console.error('GPIO MOCK: error while reading file ' +
         this.filePath, err);
        callback(err);
      } else {
        var value = +data; // coert to number
        if (value !== this.value) {
          this.value = value;
        }
        if (typeof callback === 'function') {
          callback(null, this.value);
        }
      }
    });
  },

  readSync: function() {
    this.value = fs.readFileSync(this.filePath);
    return this.value;
  },

  close: function(callback) {
    this.value = -1;
    fs.unlink(this.filePath, function(err) {
      if (err) {
        console.error('GPIO MOCK: error while closing pin ' + this.pin, err);
      } else {
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  },

  closeSync: function() {
    fs.unlinkSync(this.filePath);
    this.value = -1;
  },

  setDirectionSync: function() {
    // NOT IMPLEMENTED
  },
};

var gpio = {
  open: function(config, callback) {
    var gpioPin = new native(config, function(err) {
      callback(err, gpioPin);
    });
    return gpioPin;
  },
  openSync: function(config) {
    return new native(config);
  },
  DIRECTION: native.DIRECTION,
  EDGE: native.EDGE,
  MODE: native.MODE,
};

module.exports = gpio;
