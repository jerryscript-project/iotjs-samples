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

var EventEmitter = require('events').EventEmitter;
var mixin = require('util').mixin;

function StateMachine(config) {
  EventEmitter.call(StateMachine);

  this.states = mixin(config.states);
  this.current = config.init;
  this.state = config.init;
}

StateMachine.prototype = {
  emitonce: function(state) {
    if (this.state != state) {
      var args = Array.prototype.slice.call(arguments, 1);

      this.state = state;
      this.emit.apply(this, [this.state].concat(args));
    }
  },
  go: function(next) {
    var prev = this.current;
    var available_states = this.states[prev];

    if (next === undefined) {
      next = available_states[0];
    }

    if (available_states.indexOf(next) >= 0) {
      this.emitonce(prev + ':exit');
      this.emitonce(next + ':enter');

      this.current = next;

      this.emitonce.apply(this, Array.prototype.slice.call(arguments));
    } else {
      // this.emit('ignored');
      console.warn(next +' state change is ignored');
    }

    return this;
  },
  end: function() {
    var args = Array.prototype.slice.call(arguments);
    this.emitonce.apply(this, [this.current + ':exit'].concat(args));
  },
  state: function() {
    return this.current;
  },
  pending_next: function(next) {
    return this.go.bind(this, next);
  },
}

mixin(StateMachine.prototype, EventEmitter.prototype);

module.exports = StateMachine;
