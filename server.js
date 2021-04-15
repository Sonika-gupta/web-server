const net = require('net')
const { headParser } = require('./requestParser')
const { addRoute } = require('./routeHandler')
const config = require('./config')
const generateResponse = require('./response')
let server

function send (socket, response) {
  console.log('\n\nresponding', response)
  socket.write(response)
  // socket.emit('end')
}

async function handleRequest (request, socket, resetBuffer) {
  console.log('In handleRequest', request)
  send(socket, await generateResponse(request))
  resetBuffer()
  return true
}

function handleConnection (socket) {
  console.log('-----Connected-----')
  let buffer = Buffer.from('')
  let contentLength
  const request = {}

  socket.on('data', async (chunk) => {
    console.log('adding to buffer', chunk.length, buffer.length)
    // Assuming header is in first chunk
    let done = false
    function resetBuffer () {
      buffer = Buffer.from('')
    }
    try {
      if (buffer.length === 0) {
        const marker = chunk.indexOf('\r\n\r\n')
        headParser(chunk.slice(0, marker).toString(), request)
        contentLength = Number(request.headers['content-length'])
        buffer = Buffer.concat([buffer, chunk.slice(marker + 4)])
        if (!contentLength || contentLength === buffer.length) {
          done = await handleRequest(request, socket, resetBuffer)
        }
      } else {
        buffer = Buffer.concat([buffer, chunk])
        console.log('lengths: ', buffer.length, contentLength)
        if (buffer.length === contentLength) {
          request.body = buffer
          done = await handleRequest(request, socket, resetBuffer)
        }
      }
      setTimeout(async () => {
        if (!done) {
          send(socket, await generateResponse(request, 408))
          resetBuffer()
        }
      }, 30000)
    } catch (error) {
      console.log('-------', error)
      if (!error.code) error.code = 400
      socket.emit('error', error)
    }
  })

  socket.on('end', () => {
    console.log('\n\n-----End------ buffer.length:', buffer.length)
  })

  socket.on('error', async (e) => {
    console.log('!!', e)
    send(socket, await generateResponse(request, e.code || 500))
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
  setStatic (directory) {
    config.staticDirectory = directory
    console.log(config.staticDirectory)
    return this
  },
  get: (route, handler) => addRoute('GET', route, handler),
  post: (route, handler) => addRoute('POST', route, handler),
  delete: (route, handler) => addRoute('DELETE', route, handler),
  put: (route, handler) => addRoute('PUT', route, handler)
}
