const config = require('./config')

module.exports = function generateResponseMessage (response) {
  console.log('response', response)
  if (response.error) return errorResponse(response.statusCode, response.message)
  response.stausLine = generateStatusLine(response.statusCode || 200)
  response.headers = generateResponseHeaders(response)
  // response.body = generateResponseBody(response.responseData)
  return Buffer.concat([
    response.stausLine,
    response.headers,
    response.body || ''
  ].map(line => Buffer.from(line)))
}

function errorResponse (code, message = '') {
  const response =
    `HTTP/1.1 ${code} ${config.status[code]} \r\n` +
    `Date: ${(new Date()).toUTCString()} \r\n` +
    'Connection: keep-alive \r\n' +
    (message
      ? `Content-Length: ${message.length}\r\n` + 'Content-Type: text/plain\r\n'
      : '') +
    '\r\n' +
    message
  return response
}
/*
generateErrorResponse: (code, message) => {
  return {
    startLine: {
      scheme: 'HTTP/1.1',
      statusCode: code,
      message: config.status[code]
    },
    headers: {},
    body: message
  }
} */
/* function generateResponseBody (data = '') {
  return JSON.stringify({
    message: 'Received Data',
    length: data.length,
    data
  })
} */

function generateResponseHeaders (response) {
  const header = [
    `Date: ${(new Date()).toUTCString()}`,
    'Connection: keep-alive',
    `Content-Length : ${response.body?.length || 0}`,
    '\r\n'
  ]
  if (response.body) {
    header.splice(-1, 0, `Content-Type: ${response.type}`)
  }
  return header.join('\r\n')
}

function generateStatusLine (status) {
  return `HTTP/${config.version} ${status} ${config.status[status]} \r\n`
}
