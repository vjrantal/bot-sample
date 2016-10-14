'use strict';

var spawn = require('child_process').spawn;
var Promise = require('bluebird');

var DEFAULT_TIMEOUT = 1000;

var Program = function (command, args) {
  this.timeout = DEFAULT_TIMEOUT;

  this.spawned = spawn(command, args);
};

Program.prototype.setTimeout = function (timeout) {
  this.timeout = timeout;
};

Program.prototype.input = function (input) {
  var that = this;
  return new Promise(function (resolve, reject) {
    var line = '';
    var stdoutListener = function (data) {
      line += data;
      var split = line.split('\n');
      if (split.length === 1) {
        // Carry on since haven't yet received a complete line
        return;
      }
      that.spawned.stdout.removeListener('data', stdoutListener);
      // TODO: Provide way to get multiple lines
      resolve(split[0]);
    };
    that.spawned.stdout.addListener('data', stdoutListener);
    that.spawned.stdin.write(input + '\n');
  });
};

Program.prototype.close = function () {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.spawned.once('exit', function (code) {
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
