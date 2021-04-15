const config = require('./config')
const { getRoute } = require('./routeHandler')

/* function sendResponse (statusCode, responseData, send) {
  const response = [
    generateStatusLine(statusCode),
    generateResponseHeaders(responseData ? responseData.length : 0),
    generateResponseBody(responseData)
  ]
  response.join('\r\n')
  send(response)
}
async function generateResponse ({ headers, body }) {
  console.log('Generating response for', headers)
  let responseData, statusCode
  try {
    responseData = await methodHandler(headers, body)
    statusCode = 200
  } catch (err) {
    console.log(err)
    statusCode = 404
  }
  return sendResponse(statusCode, responseData)
} */

module.exports = async function generateResponse ({ headers, body }, statusCode) {
  let responseData = ''
  if (!statusCode) {
    console.log('Generating response for', headers)
    try {
      responseData = await methodHandler(headers, body)
    } catch (err) {
      console.log(err)
      statusCode = 404
    }
  }
  const response = [
    generateStatusLine(statusCode),
    generateResponseHeaders(responseData.length),
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

async function methodHandler ({ method, path }, requestBody) {
  // routeHandler -> staticFileHandler ?
  // console.log('Routes:', method, routes[method])
  console.log('methodHandler', { method, path })
  const [error, content] = await getRoute(method, path, requestBody)
  console.log('got content', content)
  // return parseContent(content, body)

  if (error) {
    console.log(error.error)
    throw Error(error.message)
  }
  return content
}
