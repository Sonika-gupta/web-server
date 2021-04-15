const config = require('./config')
const { routes, getRoute } = require('./routeHandler')

module.exports = function generateResponse ({ headers, body }, statusCode = 200) {
  console.log('Generating response for', headers)
  const responseData = methodHandler(headers, body)
  const response = [
    generateStatusLine(statusCode),
    generateResponseHeaders(body ? body.length : 0),
    generateResponseBody(responseData)
  ]
  return response.join('\r\n')
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
/*
function methodHandler ({ method, url }, requestBody) {
  if (method === 'POST' && !requestBody) throw Error('Post request requires body')

  // routeHandler -> staticFileHandler ?
  console.log('Routes:', method, routes[method])
  if (Object.prototype.hasOwnProperty.call(routes[method], url)) {
    const content = getContent(routes[method][url])
    var responseBody = parseContent(content, body)
  }
  console.log(responseBody)
  return responseBody || {}
} */

function getContent (path) {
  return [null, {}]
}

function methodHandler ({ method, url }, requestBody) {
  // routeHandler -> staticFileHandler ?
  // console.log('Routes:', method, routes[method])

  let p
  try {
    p = routes[method][url]
    const content = getRoute(method, url, requestBody)
    // return parseContent(content, body)
  } catch (error) {
    if (error) {
      throw Error('Method not found')
    }
  }
  return null
}
