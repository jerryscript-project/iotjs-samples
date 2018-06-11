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

function Mock(name, value) {
  if (!(this instanceof Mock)) {
    return new Mock(name, value);
  }

  this.filePath = './' + name + '.txt';
  this.value = value ? value : 0;
  this.write(this.value);
}

Mock.prototype = {
  read: function() {
    this.value = fs.readFileSync(this.filePath).toString();
    return this.value;
  },
  write: function(value) {
    this.value = value;
    fs.writeFileSync(this.filePath, value);
  }
};

module.exports = Mock;
