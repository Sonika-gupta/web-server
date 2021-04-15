module.exports = {
  version: '1.0',
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
  contentType: [
    'application/json',
    'text/plain'
  ],
  decoders: {
    'application/json': JSON.parse,
    'text/plain': String
  },
  /* transferEncodings: [
    'chunked',
    'compress',
    'deflate',
    'gzip'
  ], */
  staticDirectory: 'public'
}
