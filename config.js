const formDataParser = require('./formDataParser')
module.exports = {
  version: '1.1',
  status: {
    200: 'OK',
    400: 'Bad Request',
    404: 'Not Found',
    408: 'Request Timeout',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    505: 'HTTP Version Not Supported'
  },
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'HEAD'
  ],
  parsers: {
    'application/json': (...args) => JSON.parse(...args), /* Never assign function of a class directly. It changes 'this' object on effective function. */
    'text/plain': String,
    'mutilpart/form-data': formDataParser
  },
  contentTypes: {
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    csv: 'text/csv',
    js: 'text/javascript',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    png: 'image/png',
    json: 'application/json',
    pdf: 'application/pdf'
  },
  /* transferEncodings: [
    'chunked',
    'compress',
    'deflate',
    'gzip'
  ], */
  routes: {},
  getRoute (method, route) {
    return this.routes[method][route]
  },
  setRoute (method, route, handler) {
    if (!this.getRoute(method, route)) this.routes[method][route] = handler
  },
  initRoutes () {
    this.methods.forEach(method => (this.routes[method] = {}))
    return this.routes
  }
}
