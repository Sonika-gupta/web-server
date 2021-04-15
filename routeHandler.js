const { staticDirectory } = require('./config')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const routes = {
  GET: {},
  POST: {},
  DELETE: {},
  PUT: {},
  HEAD: {}
}

function addRoute (method, route, handler) {
  if (typeof handler !== 'function') throw Error('Expected function, got', typeof handler)
  if (!routes[method][route]) { routes[method][route] = handler }
}

async function serveStatic (route) {
  console.log('In serveStatic')
  try {
    const data = route === '/'
      ? await readFile(`${staticDirectory}/index.html`)
      : await readFile(`${staticDirectory}${route}`)

    console.log('Serving static file:', data.length)
    return [null, data]
  } catch (error) {
    return [{ error, message: `Cannot GET ${route}` }, null]
  }
}

async function getRoute (method, route, body) {
  console.log('Getting route', method, route)
  // parseURL
  return routes[method][route]
    ? [null, routes[method][route](body)]
    : (method === 'GET' ? await serveStatic(route) : [{ message: 'Route not found' }, null])
}

module.exports = {
  addRoute,
  getRoute
}
