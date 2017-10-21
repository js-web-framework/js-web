import * as inject from '../inject'
import template from '../template'
import config from './../config'
import { flashedKeys, handleRespond as respond } from './response-handler'

const fs = require('fs')
const express = require('express')
const session = require('express-session')

export const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

const bundleCSS = config.bundleCSS || 'bundle.css'
const bundleScript = config.bundleScript || 'bunde.css'
const assetsFolder = config.assetsFolder || 'assets'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(`/${assetsFolder}`, express.static(assetsFolder))
app.use(cookieParser(config.app_key))
app.use(session({
  secret: config.app_key,
  resave: true,
  saveUninitialized: true
}))
app.use(helmet())

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
}

let onSocketConnectionFunction = null
let onSocketDisconnectFunction = null

if (config.allowCrossDomain === 'true') {
  app.use(allowCrossDomain)
}

const serverConfig =
  config.https !== 'true'
    ? {}
    : {
      key: fs.readFileSync(config.https_privkey),
      cert: fs.readFileSync(config.https_cert),
      ca: fs.readFileSync(config.https_fullchain)
    }

const flashedData = (req) => {
  const flashKeys = flashedKeys(req)
  const data = {}
  flashKeys.forEach((k) => {
    data[k.replace('_FLASH_', '')] = req.session[k]
  })
  return data
}

export function route(route, func) {
  app.get(route, (req, res) => {
    respond(r => res.json(r), func, res, req)
  })
}

function Back() {}
export function back() {
  return new Back()
}

function Redirect(route, headers) {
  this.route = route
  this.headers = headers
}

export function onSocketDisconnect(func) {
  onSocketDisconnectFunction = func
}

export function onSocketConnection(func) {
  onSocketConnectionFunction = func
}

export function redirect(route) {
  return new Redirect(route)
}

export function postRoute(route, func) {
  app.post(route, (req, res) => {
    respond(r => res.json(r), func, res, req)
  })
}
const isScriptInjected = html => html.indexOf(bundleScript) > -1

const injectScript = (html) => {
  if (isScriptInjected(html)) return html
  const script = `<script src="/${assetsFolder}/${bundleScript}"></script>`
  let index = html.indexOf('</body>')
  index = index === -1 ? html.length : index
  return html.substr(0, index) + script + html.substr(index)
}

const isStyleInjected = html => html.indexOf(bundleCSS) > -1

const injectStyle = (html) => {
  if (isStyleInjected(html)) return html
  const style = `<link rel="stylesheet" href="/${assetsFolder}/${bundleCSS}">`
  let index = html.indexOf('</body>')
  index = index === -1 ? html.length : index
  return html.substr(0, index) + style + html.substr(index)
}

const handleInjections = (injections, html) => {
  if (!injections) return html
  return injectScript(injectStyle(html))
}

export const unpackArr = (arr = []) =>
  arr.reduce((packed, current) => {
    if (current.constructor.name === 'Array') return packed.concat(unpackArr(current))

    packed.push(current)
    return packed
  }, [])

const notFoundRedirect = (data) => {
  app.get('*', (req, res) => {
    const flashed = flashedData(req)
    respond(null, data, res, req)
  })
}

export const notFound = (filename, data, injections) => {
  if (!filename) {
    return notFoundRedirect(data)
  }
  const templateWithOutData = template(filename)

  if (injections) {
    inject.pack(unpackArr(injections), `${assetsFolder}/${bundleScript}`, `${assetsFolder}/${bundleCSS}`)
  }
  app.get('*', (req, res) => {
    const flashed = flashedData(req)
    respond(
      (out) => {
        res.status(404).send(handleInjections(unpackArr(injections), templateWithOutData(Object.assign(out, flashed))))
      },
      data,
      res,
      req
    )
  })
}

const fileExists = (filename) => {
  if (fs.existsSync(filename)) return true
  console.log(`${filename} - file not exists!`)
  return false
}

const routeErr = route => console.log(`Error in route: ${route}`)

export const htmlRoute = (route, filename, data, injections) => {
  const renderOnRequest = config.render_on_request || 'false'
  let templateWithOutData = ''

  if (!fileExists(filename)) return routeErr(route)

  if (renderOnRequest !== 'true') {
    templateWithOutData = template(filename)
  }

  if (injections) {
    inject.pack(unpackArr(injections), `${assetsFolder}/${bundleScript}`, `${assetsFolder}/${bundleCSS}`)
  }
  app.get(route, (req, res) => {
    if (renderOnRequest === 'true') {
      templateWithOutData = template(filename)
    }
    const flashed = flashedData(req)
    respond(
      (out) => {
        res.send(handleInjections(unpackArr(injections), templateWithOutData(Object.assign(out, flashed))))
      },
      data,
      res,
      req
    )
  })
}

const socketHandlers = []
export function socket(path, func) {
  socketHandlers.push([path, func])
}

export const start = (withSocket = false) => {
  const server =
    config.https !== 'true' ? require('http').createServer(app) : require('https').createServer(serverConfig, app)

  if (withSocket) {
    const io = require('socket.io')(server)

    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        if (onSocketDisconnectFunction) {
          onSocketDisconnectFunction(socket)
        }
      })

      for (let i = 0; i < socketHandlers.length; i++) {
        socket.on(socketHandlers[i][0], (msg) => {
          socketHandlers[i][1](msg, socket)
        })
      }

      if (onSocketConnectionFunction) {
        onSocketConnectionFunction(socket)
      }
    })
  }

  server.listen(config.port)
  console.log(`Listen on: ${config.port}`)
}
