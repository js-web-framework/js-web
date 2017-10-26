'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.start = exports.htmlRoute = exports.notFound = exports.unpackArr = exports.app = undefined;
exports.route = route;
exports.back = back;
exports.onSocketDisconnect = onSocketDisconnect;
exports.onSocketConnection = onSocketConnection;
exports.download = download;
exports.redirect = redirect;
exports.postRoute = postRoute;
exports.socket = socket;

var _inject = require('../inject');

var inject = _interopRequireWildcard(_inject);

var _template = require('../template');

var _template2 = _interopRequireDefault(_template);

var _config = require('./../config');

var _config2 = _interopRequireDefault(_config);

var _responseHandler = require('./response-handler');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const fs = require('fs');
const express = require('express');
const session = require('express-session');

const app = exports.app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const bundleCSS = _config2.default.bundleCSS || 'bundle.css';
const bundleScript = _config2.default.bundleScript || 'bunde.css';
const assetsFolder = _config2.default.assetsFolder || 'assets';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(`/${assetsFolder}`, express.static(assetsFolder));
app.use(cookieParser(_config2.default.app_key));
app.use(session({
  secret: _config2.default.app_key,
  resave: true,
  saveUninitialized: true
}));
app.use(helmet());

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
};

let onSocketConnectionFunction = null;
let onSocketDisconnectFunction = null;

if (_config2.default.allowCrossDomain === 'true') {
  app.use(allowCrossDomain);
}

const serverConfig = _config2.default.https !== 'true' ? {} : {
  key: fs.readFileSync(_config2.default.https_privkey),
  cert: fs.readFileSync(_config2.default.https_cert),
  ca: fs.readFileSync(_config2.default.https_fullchain)
};

const flashedData = req => {
  const flashKeys = (0, _responseHandler.flashedKeys)(req);
  const data = {};
  flashKeys.forEach(k => {
    data[k.replace('_FLASH_', '')] = req.session[k];
  });
  return data;
};

function route(route, func) {
  app.get(route, (req, res) => {
    (0, _responseHandler.handleRespond)(r => res.json(r), func, res, req);
  });
}

function Back() {}
function back() {
  return new Back();
}

function Redirect(route, headers) {
  this.route = route;
  this.headers = headers;
}

function Download(file) {
  this.file = file;
}

function onSocketDisconnect(func) {
  onSocketDisconnectFunction = func;
}

function onSocketConnection(func) {
  onSocketConnectionFunction = func;
}

function download(file) {
  return new Download(file);
}

function redirect(route) {
  return new Redirect(route);
}

function postRoute(route, func) {
  app.post(route, (req, res) => {
    (0, _responseHandler.handleRespond)(r => res.json(r), func, res, req);
  });
}
const isScriptInjected = html => html.indexOf(bundleScript) > -1;

const injectScript = html => {
  if (isScriptInjected(html)) return html;
  const script = `<script src="/${assetsFolder}/${bundleScript}"></script>`;
  let index = html.indexOf('</body>');
  index = index === -1 ? html.length : index;
  return html.substr(0, index) + script + html.substr(index);
};

const isStyleInjected = html => html.indexOf(bundleCSS) > -1;

const injectStyle = html => {
  if (isStyleInjected(html)) return html;
  const style = `<link rel="stylesheet" href="/${assetsFolder}/${bundleCSS}">`;
  let index = html.indexOf('</body>');
  index = index === -1 ? html.length : index;
  return html.substr(0, index) + style + html.substr(index);
};

const handleInjections = (injections, html) => {
  if (!injections) return html;
  return injectScript(injectStyle(html));
};

const unpackArr = exports.unpackArr = (arr = []) => arr.reduce((packed, current) => {
  if (current.constructor.name === 'Array') return packed.concat(unpackArr(current));

  packed.push(current);
  return packed;
}, []);

const notFoundRedirect = data => {
  app.get('*', (req, res) => {
    const flashed = flashedData(req);
    (0, _responseHandler.handleRespond)(null, data, res, req);
  });
};

const notFound = exports.notFound = (filename, data, injections) => {
  if (!filename) {
    return notFoundRedirect(data);
  }
  const templateWithOutData = (0, _template2.default)(filename);

  if (injections) {
    inject.pack(unpackArr(injections), `${assetsFolder}/${bundleScript}`, `${assetsFolder}/${bundleCSS}`);
  }
  app.get('*', (req, res) => {
    const flashed = flashedData(req);
    (0, _responseHandler.handleRespond)(out => {
      res.status(404).send(handleInjections(unpackArr(injections), templateWithOutData(Object.assign(out, flashed))));
    }, data, res, req);
  });
};

const fileExists = filename => {
  if (fs.existsSync(filename)) return true;
  console.log(`${filename} - file not exists!`);
  return false;
};

const routeErr = route => console.log('Error in route: ' + route);

const htmlRoute = exports.htmlRoute = (route, filename, data, injections) => {
  const renderOnRequest = _config2.default.render_on_request || 'false';
  let templateWithOutData = '';

  if (!fileExists(filename)) return routeErr(route);

  if (renderOnRequest !== 'true') {
    templateWithOutData = (0, _template2.default)(filename);
  }

  if (injections) {
    inject.pack(unpackArr(injections), `${assetsFolder}/${bundleScript}`, `${assetsFolder}/${bundleCSS}`);
  }
  app.get(route, (req, res) => {
    if (renderOnRequest === 'true') {
      templateWithOutData = (0, _template2.default)(filename);
    }
    const flashed = flashedData(req);
    (0, _responseHandler.handleRespond)(out => {
      res.send(handleInjections(unpackArr(injections), templateWithOutData(Object.assign(out, flashed))));
    }, data, res, req);
  });
};

const socketHandlers = [];
function socket(path, func) {
  socketHandlers.push([path, func]);
}

const start = exports.start = (withSocket = false) => {
  const server = _config2.default.https !== 'true' ? require('http').createServer(app) : require('https').createServer(serverConfig, app);

  if (withSocket) {
    const io = require('socket.io')(server);

    io.on('connection', socket => {
      socket.on('disconnect', () => {
        if (onSocketDisconnectFunction) {
          onSocketDisconnectFunction(socket);
        }
      });

      for (let i = 0; i < socketHandlers.length; i++) {
        socket.on(socketHandlers[i][0], msg => {
          socketHandlers[i][1](msg, socket);
        });
      }

      if (onSocketConnectionFunction) {
        onSocketConnectionFunction(socket);
      }
    });
  }

  server.listen(_config2.default.port);
  console.log(`Listen on: ${_config2.default.port}`);
};