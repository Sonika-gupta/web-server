const config = require('./config')

module.exports = function generateResponseMessage (response) {
  console.log('response', response)
  response.stausLine = generateStatusLine(response.statusCode || 200)
  response.headers = generateResponseHeaders(response)
  // response.body = generateResponseBody(response.responseData)
  return Buffer.concat([
    response.stausLine,
    response.headers,
    response.body || ''
  ].map(line => Buffer.from(line)))
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
  const header = []
  header.push(
    `Date: ${(new Date()).toUTCString()}`,
    'Connection: keep-alive',
    `Content-Length : ${response.body?.length || 0}`,
    '\r\n')
  if (response.body) {
    header.splice(-1, 0, `Content-Type: ${response.type}`)
  }
  return header.join('\r\n')
}

function generateStatusLine (status) {
  return `HTTP/1.1 ${status} ${config.status[status]} \r\n`
}
