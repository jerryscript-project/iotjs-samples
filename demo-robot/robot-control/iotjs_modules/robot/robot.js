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

var Moter = require('./moter');
// var TRSensor = require('trsensor');
var http = require('http');
var fs = require('fs');
/*
      HOME         A          B
         |           |          |
         |           |          |
*/

function extractPath(url) {
  var urlParts = url.split('/'),
    i = 0,
    l = urlParts.length,
    result = [];
  for (; i < l; ++i) {
    if (urlParts[i].length > 0) {
      result.push(urlParts[i]);
    }
  }
  return result;
}

// reads file from specified path
function fetchFile(path) {
  var data = null;

  if (fs.existsSync(path)) {
    data = fs.readFileSync(path);
  }
  return data;
}


var HOME = 0, A = 1, B = 2;
var RUNNING = 0, STOP = 1;
var FORWARD = 0, BACKWARD = 1;

function Robot(pin) {
  this.moter = new Moter(pin.moter);
  // this.trSensor = new TRSensor(pin.tr);

  this.curPosition = HOME;
  this.curStatus = STOP;

  this.loop = null; // Interval for checking line
}

Robot.HOME = HOME;
Robot.A = A;
Robot.B = B;

Robot.prototype.createServer = function(serverPort, callback) {
  this.server = http.createServer(function(req, res) {
    var path = extractPath(req.url);
    var root = process.cwd();
    if (process.platform === 'tizen') {
      root = require('tizen').getResPath();
      if (root === '') {
        root = process.cwd();
      }
    }
    switch (path[0]) {
      case undefined:
        var fileData = fetchFile(root + '/'  + 'robot_control.html');
        if (fileData) {
          res.writeHead(200);
          res.end(fileData);
        } else {
          console.log('cannot find control page');
        }
        break;
      default:
        callback(path, req, res);
    }
  });

  this.server.listen(serverPort);
};

Robot.prototype.go = function(destination) {
  if (this.curStatus === RUNNING) {
    console.log('already moving');
    return false;
  }
  if (this.curPosition === destination) {
    console.log('Cannot go the destination');
    return false;
  }

  console.log('go robot from', this.curPosition, 'to', destination);

  if(this.curPosition === HOME) {
    if (destination === A) {
      this._runningRobot(FORWARD, 2);
    } else if (destination === B) {
      this._runningRobot(FORWARD, 3);
    }
  } else if (this.curPosition === A) {
    if (destination === HOME) {
      this._runningRobot(BACKWARD, 2);
    } else if (destination === B) {
      this._runningRobot(FORWARD, 1);
    }
  } else if (this.curPosition === B) {
    if (destination === HOME) {
      this._runningRobot(BACKWARD, 3);
    } else if(destination === A) {
      this._runningRobot(BACKWARD, 2);
    }
  }

  this.curPosition = destination;
};

Robot.prototype.stop = function() {
  this.reset();
  if (this.loop !== null) {
    clearInterval(this.loop);
    this.loop = null;
  }
};

Robot.prototype.reset = function() {
  this.curPosition = HOME;
  this.curStatus = STOP;
  this.moter.stop();
}

// Interval callback function
Robot.prototype._runningRobot = function(dir, cntLine) {
  this.curStatus = RUNNING;

  if (dir === FORWARD) {
    this.moter.forward();
  } else {dir === BACKWARD} {
    this.moter.backward();
  }
  var self = this;
  this.loop = setInterval(function() {
    var cnt = 0;
    var flag = false;

    // if (self.trSensor.isAllEnable() === true) {
    //   if (flag === false) {
    //     flag = true;
    //     cnt++;
    //     console.log('line detection:', cnt);

    //     if (cnt === cntLine) {
    //       setTimeout(function() {
    //         console.log('line detection: stop');
    //         // Stop robot after 2000ms.
    //         self.moter.stop();
    //         self.curStatus = STOP;
    //       }, 2000);
    //       clearInterval(self.loop);
    //       self.loop = null;
    //     }
    //   }
    // } else {
    //   flag = false;
    // }
  }, 1000);
};

module.exports = Robot;
