const { staticDirectory, contentTypes } = require('./config')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)

const config = require('./config')
const routes = config.initRoutes()

module.exports = { staticFileHandler, routeHandler, notFoundHandler }

async function staticFileHandler (request, response) {
  try {
    // check for relative path
    const resourcePath = `${staticDirectory}` + request.path + (request.path.endsWith('/') ? 'index.html' : '')
    const data = await readFile(resourcePath)
    if (data) {
      response.body = data
      response.type = contentTypes[resourcePath.split('.').pop().trim()]
      request.sendResponse(response)
      return true
    }
  } catch (err) {
    console.log(err)
  }
}

async function routeHandler (request, response) {
  const handler = routes[request.method][request.path]
  if (handler) {
    response.responseData = await handler(request, response)
    request.sendResponse(response)
    return true
  }
}

function notFoundHandler (request, response) {
  response.statusCode = 404
  request.sendResponse(response)
  return true
}
