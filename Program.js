'use strict';

var spawn = require('child_process').spawn;
var readline = require('readline');
var Promise = require('bluebird');

var Program = function (command, args) {
  this.trim = true;
  this.ignores = null;
  this.ignoreInput = false;

  this.spawned = spawn(command, args);
  this.lineReader = readline.createInterface({
    input: this.spawned.stdout
  });
};

Program.prototype.setTimeout = function (timeout) {
  this.timeout = timeout;
};

Program.prototype.setTrim = function (trim) {
  this.trim = trim;
};

Program.prototype.setIgnores = function (expression) {
  this.ignores = expression;
};

Program.prototype.setIgnoreInput = function (ignoreInput) {
  this.ignoreInput = ignoreInput;
};

Program.prototype.waitUntil = function (expression) {
  var that = this;
  return new Promise(function (resolve, reject) {
    var lineListener = function (line) {
      if (!line.match(expression)) {
        return;
      }
      that.lineReader.removeListener('line', lineListener);
      resolve();
    };
    that.lineReader.addListener('line', lineListener);
  });
};

Program.prototype.input = function (input) {
  var that = this;
  return new Promise(function (resolve, reject) {
    var lineListener = function (line) {
      // TODO: Provide a mechanism to wait for multiple lines
      // as response to an input

      if (that.ignoreInput) {
        if (line.trim() === input) {
          return;
        }
      }

      if (that.ignores) {
        if (line.match(that.ignores)) {
          return;
        }
      }

      that.lineReader.removeListener('line', lineListener);

      var singleLine = line;
      if (that.trim) {
        singleLine = singleLine.trim();
      }
      resolve(singleLine);
    };
    that.lineReader.addListener('line', lineListener);
    that.spawned.stdin.write(input + '\n');
  });
};

Program.prototype.close = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.spawned.once('exit', function (code) {
      that.lineReader.close();
      that.spawned.stdin.end();
      // In case of killing the process, the exit code is null
      if (code === null) {
        resolve();
      } else {
        reject(new Error('Program exit with code: ' + code));
      }
    });
    that.spawned.kill();
  });
};

module.exports = Program;
