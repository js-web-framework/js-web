import { makeAuth } from 'js-auth'
import { handleRespond } from './../routing/response-handler'

export default function (app, config) {
  return makeAuth(app, config, handleRespond)
}
