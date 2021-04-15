
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

function checkStatic (method, route) {
  if (method !== 'GET') return null
  else {
    switch (route) {
      case '/': // return
    }
  }
  // fs.stat staticDirectory/route
}

function getRoute (method, route, body) {
  // parseURL
  return routes[method][route] ? routes[method][route](body) : checkStatic(method, route)
}

module.exports = {
  routes,
  addRoute,
  getRoute
}
