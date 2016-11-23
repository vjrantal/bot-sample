'use strict';

var builder = require('botbuilder');

var connector = new builder.ChatConnector({
  appId: process.env.CHAT_CONNECTOR_APP_ID,
  appPassword: process.env.CHAT_CONNECTOR_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
  function (session, args, next) {
    if (!session.userData.name) {
      session.beginDialog('/promptName');
    } else {
      next();
    }
  },
  function (session, results) {
    if (results.name) {
      session.userData.name = results.name;
      session.endDialog('Hi %s, say something to me and I will echo it back.', session.userData.name);
    } else {
      session.send('%s, I heard: %s', session.userData.name, session.message.text);
      session.endDialog('Say something else...');
    }
  }
]);

bot.dialog('/promptName', [
  function (session) {
    builder.Prompts.text(session, 'Hello... What is your name?');
  },
  function (session, results) {
    session.endDialogWithResult({
      name: results.response
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
