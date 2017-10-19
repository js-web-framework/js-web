'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app, config) {
  return (0, _jsAuth.makeAuth)(app, config, _responseHandler.handleRespond);
};

var _jsAuth = require('js-auth');

var _responseHandler = require('./../routing/response-handler');