const net = require('net')
const config = require('./config')

const { parseStartLine, parseheaders, bodyParser } = require('./requestParsers')
const { staticFileHandler, routeHandler, notFoundHandler } = require('./handlers')
const generateResponseMessage = require('./response')
const routes = config.initRoutes()
let server

const middlewares = [
  // cookieParser,
  bodyParser
]

function addRoute (method, route, handler) {
  if (typeof handler !== 'function') throw Error('Expected function, got', typeof handler)
  // check for args
  if (!routes[method][route]) routes[method][route] = handler
}

async function processRequest (request, response) {
  const handlers = [
    ...middlewares,
    routeHandler,
    notFoundHandler
  ]
  console.log(handlers)
  console.log('Request: ', request)
  let done = false
  for (const handler of handlers) {
    done = await handler(request, response)
    console.log(handler, done)
    if (done) break
  }
  return done
}

function handleConnection (socket) {
  console.log('-----Connected-----')
  let buffer = Buffer.from('')
  let contentLength

  function sendResponse (response) {
    socket.write(generateResponseMessage(response))
    socket.emit('end')
    reset()
    return true
  }
  const request = { sendResponse }
  const response = { }

  function reset () {
    buffer = Buffer.from('')
    for (const prop in request) {
      delete request[prop]
    }
    for (const prop in response) {
      delete response[prop]
    }
  }

  socket.on('data', async (chunk) => {
    console.log('adding to buffer', chunk.length, buffer.length)
    // Assuming header is in first chunk
    let done = false
    try {
      if (buffer.length === 0) {
        const bodyMarker = chunk.indexOf('\r\n\r\n')
        const head = chunk.slice(0, bodyMarker)

        const headerMarker = chunk.indexOf('\r\n')
        Object.assign(request, parseStartLine(head.slice(0, headerMarker).toString()))
        request.headers = parseheaders(head.slice(headerMarker + 2).toString())

        contentLength = Number(request.headers['content-length'])
        chunk = chunk.slice(bodyMarker + 4)
      }
      buffer = Buffer.concat([buffer, chunk])
      console.log('lengths: ', buffer.length, contentLength)
      if (!contentLength || contentLength === buffer.length) {
        request.body = buffer
        done = await processRequest(request, response)
      }
      setTimeout(() => {
        if (!done) {
          reset()
          response.statusCode = 408
          response.error = true
          sendResponse(generateResponseMessage(response))
        }
      }, 30000)
    } catch (error) {
      socket.emit('error', error)
    }
  })

  socket.on('end', () => {
    console.log('\n\n-----End------ buffer.length:', buffer.length)
  })

  socket.on('error', async (e) => {
    console.log('!!', e)
    response.statusCode = e.code || 500
    response.error = true
    sendResponse(response)
  })
}

module.exports = {
  createServer () {
    server = net.createServer(handleConnection)
    server.on('error', (error) => {
      console.log('Server Error', error)
    })
    return this
  },
  listen (port) {
    if (!server) throw Error('Server Undefined')
    server.listen(port, () => console.log('server listening', server.address()))
    return this
  },
  static: (directory) => staticFileHandler(directory),
  use (middleware) {
    middlewares.push(middleware)
    console.log('adding to middlewares', middlewares)
  },
  get: (route, handler) => addRoute('GET', route, handler),
  post: (route, handler) => addRoute('POST', route, handler),
  delete: (route, handler) => addRoute('DELETE', route, handler),
  put: (route, handler) => addRoute('PUT', route, handler)
}
