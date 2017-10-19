'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.auth = exports.request = exports.inject = exports.helpers = exports.storage = exports.config = exports.moment = undefined;

var _routing2 = require('./routing');

Object.keys(_routing2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _routing2[key];
    }
  });
});

var _migration = require('./migration');

Object.keys(_migration).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _migration[key];
    }
  });
});

var _mail = require('./mail');

Object.keys(_mail).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _mail[key];
    }
  });
});

var _config2 = require('./config');

var _config3 = _interopRequireDefault(_config2);

var _routing = _interopRequireWildcard(_routing2);

var _storage2 = require('./storage');

var _storage = _interopRequireWildcard(_storage2);

var _helpers2 = require('./helpers');

var _helpers = _interopRequireWildcard(_helpers2);

var _inject2 = require('./inject');

var _inject = _interopRequireWildcard(_inject2);

var _request2 = require('./request');

var _request = _interopRequireWildcard(_request2);

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const moment = exports.moment = require('moment');

const config = exports.config = _config3.default;

const storage = exports.storage = _storage;
const helpers = exports.helpers = _helpers;
const inject = exports.inject = _inject;
const request = exports.request = _request;

const auth = exports.auth = (0, _auth2.default)(_routing.app, config);