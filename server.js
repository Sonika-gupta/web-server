const net = require('net')
const { headParser } = require('./requestParser')
const { addRoute } = require('./routeHandler')
const config = require('./config')
const generateResponse = require('./response')

function createServer (port = 8000) {
  const server = net.createServer(handleConnection)
  server.on('error', (error) => {
    console.log('Server Error', error)
  }).listen(port, () => console.log('server listening', server.address()))
}

function handleConnection (socket) {
  console.log('-----Connected-----')
  let buffer = Buffer.from('')
  let contentLength
  const request = {}

  socket.on('data', (chunk) => {
    console.log('adding to buffer', chunk.length, buffer.length)
    // Assuming header is in first chunk
    if (buffer.length === 0) {
      const marker = chunk.indexOf('\r\n\r\n')
      headParser(chunk.slice(0, marker).toString(), request)
      console.log(request)

      contentLength = Number(request.headers['content-length'])
      buffer = Buffer.concat([buffer, chunk.slice(marker + 4)])
      if (!contentLength || contentLength === buffer.length) {
        handleRequest(request, socket)
      }
    } else {
      buffer = Buffer.concat([buffer, chunk])
      console.log('lengths: ', buffer.length, contentLength)
      if (buffer.length === contentLength) {
        request.body = buffer
        handleRequest(request, socket)
      }
    }
  })

  socket.on('end', () => {
    console.log('\n\n-----End------ buffer.length:', buffer.length)
  })

  socket.on('error', e => {
    console.log('!!', e)
    socket.write(generateResponse(request, e.code))
  })
}

function handleRequest (request, socket) {
  console.log('In handleRequest', request)
  const response = generateResponse(request)
  console.log('\n\nresponding', response)

  socket.write(response)
  socket.emit('end')
}

module.exports = {
  createServer,
  get: (route, handler) => addRoute('GET', route, handler),
  post: (route, handler) => addRoute('POST', route, handler),
  delete: (route, handler) => addRoute('DELETE', route, handler),
  put: (route, handler) => addRoute('PUT', route, handler),
  setStatic: (directory) => (config.staticDirectory = directory)
}
