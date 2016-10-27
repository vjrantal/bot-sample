'use strict';

module.exports = function (listener) {
  return function (context, req) {
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
};
