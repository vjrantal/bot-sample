'use strict';

var test = require('tape');
var Promise = require('bluebird');

var Command = require('command-handler');

test('bot greets with name only at first run', function (t) {
  var botCommand = new Command('node', ['index.js']);

  var emulatorCommand = new Command('mono', [process.env.BOT_FRAMEWORK_EMULATOR_PATH]);

  // Ignore the title lines the emulator output
  emulatorCommand.setIgnores(/^(User1|Bot1) said:$/);
  // Ignore the input, because the emulator echoes back what
  // the user says
  emulatorCommand.setIgnoreInput(true);

  // First wait for the bot and the emulator to output the
  // message from which we know they are ready to start testing
  Promise.all([
    emulatorCommand.waitUntil(/^Send message to bot:$/),
    botCommand.waitUntil(/^restify listening to.*/)
  ])
    .then(function () {
      // An example initial message from the user
      return emulatorCommand.input('Hi');
    })
    .then(function (output) {
      // We expect the bot to ask the name first
      t.equal(output, 'Hello... What is your name?');
      // Send the name of this user
      return emulatorCommand.input('Tester');
    })
    .then(function (output) {
      // The bot should greet with the name we set earlier
      t.equal(output, 'Hi Tester, say something to me and I will echo it back.');
      // Say something to the bot
      return emulatorCommand.input('Something');
    })
    .then(function (output) {
      // The bot should not send the greeting anymore, but instead,
      // the message sent should be echoed back
      t.equal(output, 'Tester, I heard: Something');

      // Wait for both Commands to close and then end the testing
      return Promise.all([
        emulatorCommand.close(),
        botCommand.close()
      ]).then(function () {
        t.end();
      });
    })
    .catch(function (error) {
      t.fail(error);
      t.end();
    });
});
