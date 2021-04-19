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
    // check for static function before assigning to other variable/object property
    'application/json': JSON.parse,
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
  staticDirectory: 'public',
  initRoutes () {
    const routes = {}
    this.methods.forEach(method => (routes[method] = {}))
    return routes
  }
}
