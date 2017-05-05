'use strict';

module.exports = function (listener) {
  return {
    post: function (event, context, callback) {
      var _status = null;
      var _body = null;
      var _respond = function (status, body) {
        callback(null, {
          statusCode: status || 200,
          body: body || ''
        });
      };

      var req = {
        body: JSON.parse(event.body),
        headers: event.headers
      };

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

      listener(req, res);
    }
  };
};
