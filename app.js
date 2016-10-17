'use strict';

var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
  appId: process.env.CHAT_CONNECTOR_APP_ID,
  appPassword: process.env.CHAT_CONNECTOR_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, { persistConversationData: true });
server.post('/api/messages', connector.listen());

bot.dialog('/', function (session) {
  session.send('%s, I heard: %s', session.userData.name, session.message.text);
  session.send('Say something else...');
});

// Install First Run middleware and dialog
bot.use(builder.Middleware.firstRun({ version: 1.0, dialogId: '*:/firstRun' }));
bot.dialog('/firstRun', [
  function (session) {
    builder.Prompts.text(session, 'Hello... What is your name?');
  },
  function (session, results) {
    // We'll save the users name and send them an initial greeting. All
    // future messages from the user will be routed to the root dialog.
    session.userData.name = results.response;
    session.endDialog('Hi %s, say something to me and I will echo it back.', session.userData.name);
  }
]);
