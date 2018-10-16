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

var fs = require('fs');
var http = require('http');

// The server waits for connections and sends the requested data.
// Note: this example is only for PNG images.
http.createServer(function (request, response) {
  var filePath = '.' + request.url;
  var fd;

  if (!fs.existsSync(filePath)) {
    return false;
  }

  // Check the file extension.
  if (filePath.split('.').pop() !== 'png') {
    console.log('This example is only for png files.');
    return false;
  }

  // Read the file by 1 KB chunks.
  fs.open(filePath, "r", function(err, _fd) {
    fd = _fd;

    var stat = fs.fstatSync(fd);
    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Content-Length', stat.size);
    response.writeHead(200);
    response.write('');
  
    var buffer = new Buffer(1024);
    read(fd, buffer);
  });

  // Read 1 KB chunk into the buffer.
  var read = function(fd, buffer) {
    fs.read(fd, buffer, 0, buffer.length, -1, after_read);
  };

  // Send the content to the client.
  var after_read = function(err, bytes_read, buffer) {
    if (err) {
      console.log("Error reading static file.");
      fs.close(fd);
    }

    if (bytes_read === 0) {
      fs.close(fd, function(err) {
        if (err) {
          console.log("Error closing file.");
        }
      });

      response.end();
    } else {
      response.write(buffer.slice(0, bytes_read), function() {
        read(fd, buffer);
      });
    }
  };

  return true;
}).listen(8822);

console.log('Server is running at http://127.0.0.1:8822/');
