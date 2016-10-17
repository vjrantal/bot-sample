'use strict';

var test = require('tape');
var Promise = require('bluebird');

var Program = require('./Program.js');

test('bot greets with name only at first run', function (t) {
  var botProgram = new Program('node', ['app.js']);

  var emulatorProgram = new Program('mono', [process.env.BOT_FRAMEWORK_EMULATOR_PATH]);

  // Ignore the title lines the emulator output
  emulatorProgram.setIgnores(/^(User1|Bot1) said:$/);
  // Ignore the input, because the emulator echoes back what
  // the user says
  emulatorProgram.setIgnoreInput(true);

  // First wait for the bot and the emulator to output the
  // message from which we know they are ready to start testing
  Promise.all([
    emulatorProgram.waitUntil(/^Send message to bot:$/),
    botProgram.waitUntil(/^restify listening to.*/)
  ])
    .then(function () {
      // An example initial message from the user
      return emulatorProgram.input('Hi');
    })
    .then(function (output) {
      // We expect the bot to ask the name first
      t.equal(output, 'Hello... What is your name?');
      // Send the name of this user
      return emulatorProgram.input('Tester');
    })
    .then(function (output) {
      // The bot should greet with the name we set earlier
      t.equal(output, 'Hi Tester, say something to me and I will echo it back.');
      // Say something to the bot
      return emulatorProgram.input('Something');
    })
    .then(function (output) {
      // The bot should not send the greeting anymore, but instead,
      // the message sent should be echoed back
      t.equal(output, 'Tester, I heard: Something');

      // Wait for both programs to close and then end the testing
      return Promise.all([
        emulatorProgram.close(),
        botProgram.close()
      ]).then(function () {
        t.end();
      });
    })
    .catch(function (error) {
      t.fail(error);
      t.end();
    });
});
