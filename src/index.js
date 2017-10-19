export const moment = require('moment')

import _config from './config'
import * as _routing from './routing'

export * from './routing'
export * from './migration'
export * from './mail'

export const config = _config

import * as _storage from './storage'

export const storage = _storage
import * as _helpers from './helpers'

export const helpers = _helpers
import * as _inject from './inject'

export const inject = _inject
import * as _request from './request'

export const request = _request

import makeAuthFunctions from './auth'

export const auth = makeAuthFunctions(_routing.app, config)
