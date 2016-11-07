'use strict';

module.exports = function (listener) {
  return function (context, req) {
    // When request comes in, pass it to bot's listener function
    // while using the Express-style response object found from
    // context.res.
    listener(req, context.res);
  };
};
