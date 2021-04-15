module.exports = {
  version: '1.0',
  status: {
    200: 'OK',
    400: 'Bad Request',
    404: 'Not Found',
    500: 'Internal Server Error'
  },
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
