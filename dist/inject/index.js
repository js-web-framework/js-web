'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pack = undefined;

var _react = require('./react');

Object.keys(_react).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _react[key];
    }
  });
});

var _jsPack = require('js-pack');

Object.defineProperty(exports, 'pack', {
  enumerable: true,
  get: function () {
    return _jsPack.pack;
  }
});
exports.jquery = jquery;
exports.socketIO = socketIO;
exports.bootstrap = bootstrap;
exports.style = style;
exports.googleAnalytics = googleAnalytics;
exports.script = script;

var pack = _interopRequireWildcard(_jsPack);

var _cdns = require('./cdns');

var cdns = _interopRequireWildcard(_cdns);

var _config = require('./../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const fs = require('fs');

const isURL = str => new RegExp('((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?', 'i').test(str);

function jquery() {
  return pack.scriptCDN(cdns.jquery);
}

function socketIO() {
  return pack.scriptCDN(cdns.socketIO);
}

function bootstrap() {
  return [pack.scriptCDN(cdns.bootstrapJS), pack.cssCDN(cdns.bootstrapCSS)];
}

function style(str) {
  if (isURL(str)) {
    return pack.cssCDN(str);
  }
  if (!fs.existsSync(str)) {
    console.log(`${str} - file not exists!`);
    return pack.cssRAW('');
  }
  if (str.indexOf('.sass') > -1 || str.indexOf('.scss') > -1) {
    // .sass||.scss
    return pack.sass(str);
  }
  if (str.indexOf('.styl') > -1) {
    return pack.stylus(str);
  }
  return pack.cssFile(str);
}

function googleAnalytics() {
  return pack.scriptRAW(`
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', '${_config2.default.google_analytics}', 'auto');
    ga('send', 'pageview');`);
}

function script(str) {
  if (isURL(str)) {
    return pack.scriptCDN(str);
  }
  if (!fs.existsSync(str)) {
    console.log(`${str} - file not exists!`);
    return pack.scriptRAW('');
  }
  return pack.scriptFile(str);
}