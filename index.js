'use strict';

var builder = require('botbuilder');
var restify = require('restify');

var connector = new builder.ChatConnector({
  appId: process.env.CHAT_CONNECTOR_APP_ID,
  appPassword: process.env.CHAT_CONNECTOR_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, { persistConversationData: true });

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

var listener = connector.listen();

if (process.env.FUNCTIONS_EXTENSION_VERSION) {
  // If we are in the Azure Functions runtime,
  // export the function that handles requests.
  module.exports = function (context, req) {
    var _status = null;
    var _body = null;
    var _respond = function (status, body) {
      context.res = {
        status: status || 200,
        body: body || ''
      };
      context.done();
    };
    // The response object created here creates a
    // compatility layer between respose object the bot
    // expects and the reponse object used in Azure Functions.
    var res = {
      send: function (status, body) {
        _respond(status, body);
      },
      status: function (status) {
        _status = status;
      },
      write: function (body) {
        _body = body;
      },
      end: function () {
        _respond(_status, _body);
      }
    };
    // When request comes in, pass it to bot's listener function.
    listener(req, res);
  };
} else {
  // When run outside of Azure functions, create a restify
  // server and pass bot's listener as the handler.
  var server = restify.createServer();
  server.post('/api/messages', listener);
  server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
  });
}
