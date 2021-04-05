const net = require('net')

const server = net.createServer((socket) => {
  // if -> socket.on('end') -> complete
  // else:
  // Keep on a loop .on data
  socket.on('data', (buffer) => {
    const requestString = buffer.toString()
    const request = requestHandler(requestString)
    console.log('Request: ', request)
  })
  // first parse header and check content length
  // wait on data till the whole length is received
  // add a timeout

  // Header ends on double crlf
  // body after double crlf

  // limit: 64k
  socket.on('error', (error) => {
    console.log(error)
  })
})

function requestHandler (requestString) {
  console.log(requestString)
  const [request, ...requestHeaders] = requestString.split('\r\n')
  console.log(request, requestHeaders)
  const [method, url, protocol] = request.split(' ')
  const headers = {}
  requestHeaders.forEach(header => {
    const [key, value] = header.split(':')
    headers[key] = value
  })
  return {
    method,
    url,
    protocol,
    headers
  }
}

server.listen(8000, () => console.log('server listening', server.address()))
server.on('connection', (client) => {
  console.log('-------------- client connected')
  client.write('Connected to Server!')
  // console.log(client)
})
