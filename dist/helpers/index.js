'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const bcrypt = require('bcryptjs');

const takeFirst = exports.takeFirst = arr => arr.length > 0 ? arr[0] : [];

const hash = exports.hash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(5));

const compareHash = exports.compareHash = (password, hash) => bcrypt.compareSync(password, hash);