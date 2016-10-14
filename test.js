'use strict';

var test = require('tape');

var Program = require('./Program.js');

test('bot greets with name only at first run', function (t) {
  var botProgram = new Program('node', ['app.js']);

  botProgram.input('Hi')
    .then(function (output) {
      t.equal(output, 'Hello... What is your name?');
      return botProgram.input('Tester');
    })
    .then(function (output) {
      t.equal(output, 'Hi Tester, say something to me and I will echo it back.');
      return botProgram.input('Something');
    })
    .then(function (output) {
      // The bot should not send the greeting anymore, but instead,
      // the message should be echoed back
      t.equal(output, 'Tester, I heard: Something');
      botProgram.close().then(function () {
        t.end();
      });
    })
    .catch(function (error) {
      t.fail(error);
      t.end();
    });
});
