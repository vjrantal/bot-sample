'use strict';

var restify = require('restify');

module.exports = function (listener) {
  var server = restify.createServer();
  server.post('/api/messages', listener);
  server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
  });
};
