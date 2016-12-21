'use strict';

var builder = require('botbuilder');

var connector = new builder.ChatConnector({
  appId: process.env.CHAT_CONNECTOR_APP_ID,
  appPassword: process.env.CHAT_CONNECTOR_APP_PASSWORD
});

var LUIS_RECOGNIZER_URL = process.env.LUIS_RECOGNIZER_URL;

var recognizers = [];
if (LUIS_RECOGNIZER_URL) {
  recognizers = [new builder.LuisRecognizer(process.env.LUIS_RECOGNIZER_URL)];
}
var intents = new builder.IntentDialog({
  recognizers: recognizers
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', intents);

intents.onDefault([
  function (session, args, next) {
    if (!session.userData.name) {
      session.beginDialog('/promptName');
    } else {
      next();
    }
  },
  function (session, results) {
    if (results.response) {
      session.userData.name = results.response;
      session.endDialog('Hi %s, say something to me and I will echo it back.', session.userData.name);
    } else {
      session.send('%s, I heard: %s', session.userData.name, session.message.text);
      session.endDialog('Say something else...');
    }
  }
]);

intents.matches('ChangeName', [
  function (session, args, next) {
    var name = builder.EntityRecognizer.findEntity(args.entities, 'Name');
    if (!name) {
      session.beginDialog('/promptName');
    } else {
      next({
        response: name.entity
      });
    }
  },
  function (session, results) {
    if (results.response) {
      session.userData.name = results.response;
      session.send('Name changed to %s', results.response);
    }
  }
]);

bot.dialog('/promptName', [
  function (session) {
    builder.Prompts.text(session, 'Howdy... What is your name?');
  },
  function (session, results) {
    session.endDialogWithResult({
      response: results.response
    });
  }
]);

var listener = connector.listen();

if (process.env.FUNCTIONS_EXTENSION_VERSION) {
  // If we are in the Azure Functions runtime.
  module.exports = require('./deployment/functions.js')(listener);
} else if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // If we are in the Serverless runtime.
  module.exports = require('./deployment/serverless.js')(listener);
} else {
  // On other environments, use restify for handling requests.
  require('./deployment/restify.js')(listener);
}
