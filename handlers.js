const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)

const config = require('./config')
config.routes = config.initRoutes()

function serveStatic (directory) {
  return async function staticFileHandler (request, response) {
    try {
    // check for relative path
      const resourcePath = `${directory}` + request.path + (request.path.endsWith('/') ? 'index.html' : '')
      const data = await readFile(resourcePath)
      if (data) {
        response.body = data
        response.type = config.contentTypes[resourcePath.split('.').pop()]
        request.sendResponse(response)
        return true
      }
    } catch (err) {
      response.message = `CANNOT GET ${request.path}`
      console.log('File Handler Error', err)
    }
  }
}

async function routeHandler (request, response) {
  const handler = config.getRoute(request.method, request.path)
  if (handler) {
    response.responseData = await handler(request, response)
    request.sendResponse(response)
    return true
  }
}

function notFoundHandler (request, response) {
  response.statusCode = 404
  response.error = true
  request.sendResponse(response)
  return true
}

module.exports = { serveStatic, routeHandler, notFoundHandler }
