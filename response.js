const config = require('./config')
module.exports = function generateResponse (request, statusCode = 200) {
  const responseData = methodHandler(request)
  const response = [
    generateStatusLine(statusCode),
    generateResponseHeaders(0),
    generateResponseBody(responseData)
  ]
  return Buffer.from(response.join('\r\n'))
}

function generateResponseBody (data = '') {
  return JSON.stringify({
    message: 'Received Data',
    length: data.length,
    data
  })
}

function generateResponseHeaders (length) {
  const header = []
  header.push(
    `date: ${(new Date()).toUTCString()}`,
    'connection: keep-alive',
    `content-length : ${length}`,
    '\r\n')
  return header.join('\r\n')
}

function generateStatusLine (status) {
  return `HTTP/1.1 ${status} ${config.status[status]} \r\n`
}

function methodHandler ({ method, url, headers, body }) {
  // routeHandler -> staticFileHandler ?
}
