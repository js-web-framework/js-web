'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleRespond = exports.flashedKeys = undefined;

var _config = require('./../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const jwt = require('jsonwebtoken');

const backUrl = req => req.header('Referer') || '/';

const flashedKeys = exports.flashedKeys = req => Object.keys(req.session).filter(k => k.indexOf('_FLASH_') > -1);
const clearFlashedData = (req, d) => {
  if (req.session) {
    const flashKeys = flashedKeys(req);
    flashKeys.forEach(k => delete req.session[k]);
  }
  return d;
};

const sendError = res => e => {
  res.sendStatus(500);
  console.log(['err in route', res.req.url, e]);
};

const setCookie = (key, val, days, res) => {
  const options = {
    maxAge: 1000 * 60 * 60 * 24 * days,
    httpOnly: true,
    signed: true
  };
  res.cookie(key, val, options);
};

const getUserImputs = req => {
  let params = Object.assign({}, req.body, req.params);
  params = Object.assign({}, params, req.query);
  params.take = allowedKeys => {
    const newObj = {};
    Object.keys(params).forEach(key => {
      if (allowedKeys.indexOf(key) > -1) {
        newObj[key] = params[key];
      }
    });
    return newObj;
  };
  params.only = params.take;
  return params;
};

const runFunc = (respondFunc, output, res, req) => handleRespond(respondFunc, output({
  jwtSign: (payload = { id: 1 }) => jwt.sign(payload, _config2.default.app_key),
  jwtVerify: async () => new Promise((resolve, reject) => {
    const token = req.headers['x-access-token'];
    if (!token) {
      reject('no token');
    }
    jwt.verify(token, _config2.default.app_key, (err, decoded) => {
      if (err) {
        reject('wrong token');
      }
      resolve(decoded);
    });
  }),
  input: getUserImputs(req),
  session: {
    get: (key, std) => req.session[key] ? req.session[key] : std,
    set: (key, val) => {
      req.session[key] = val;
    },
    getFlash: (key, std) => req.session[`_FLASH_${key}`] ? req.session[`_FLASH_${key}`] : std,
    setFlash: (key, val) => {
      req.session[`_FLASH_${key}`] = val;
    }
  },
  cookie: {
    get: (key, std) => req.signedCookies[key] ? req.signedCookies[key] : std,
    set: (key, val, days = 1) => setCookie(key, val, days, res)
  },
  res,
  req
}), res, req);

const handleRespond = exports.handleRespond = (respondFunc, output, res, req) => {
  if (!output) {
    console.log('! No return in route !');
    output = {};
  }
  switch (output.constructor.name) {
    case 'AsyncFunction':
      runFunc(respondFunc, output, res, req);
      break;
    case 'Function':
      runFunc(respondFunc, output, res, req);
      break;
    case 'Promise':
      output.then(r => handleRespond(respondFunc, r, res, req)).catch(sendError(res));
      break;
    case 'Redirect':
      if (output.headers) {
        res.set(output.headers);
      }
      res.redirect(output.route);
      break;
    case 'Download':
      res.download(output.file);
      break;
    case 'Back':
      res.redirect(backUrl(req));
      break;
    default:
      respondFunc(clearFlashedData(req, output));
  }
};