const net = require('net')
const config = require('./config')
const generateResponse = require('./response')

const server = net.createServer(handleConnection)
server.on('error', (error) => {
  console.log('Server Error', error)
}).listen(8000, () => console.log('server listening', server.address()))

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
      contentLength = Number(request.headers['content-length'])
      buffer = Buffer.concat([buffer, chunk.slice(marker + 4)])
    } else {
      buffer = Buffer.concat([buffer, chunk])
      console.log('lengths: ', buffer.length, contentLength)
      if (buffer.length === contentLength) {
        console.log('sending to parse', buffer.length)

        bodyParser(buffer, request)
        console.log(request)

        const response = generateResponse(request)
        console.log('\n\nresponding', response)

        socket.write(response)
        socket.emit('end')
      }
    }
  })

  socket.on('end', () => {
    console.log('\n\n-----End------ buffer.length:', buffer.length)
  })
  /*
  socket.on('error', e => {
    console.log('!!', e)
    socket.write(generateResponse(request, e.code))
  }) */
}

function headParser (head, request) {
  console.log('headParser: head.length', head.length)
  request.headers = {}

  const [startLine, ...headerLines] = head.split('\r\n')
  Object.entries(parseStartLine(startLine)).forEach(([key, value]) => setHeader(request, key, value))

  headerLines.forEach(line => {
    const [key, value] = line.split(':')
    setHeader(request, key.toLowerCase(), value.trim())
  })
}

function setHeader (request, key, value) {
  request.headers[key] = value
}

function parseStartLine (startLine) {
  const [method, path, scheme] = startLine.trim().split(' ')
  const version = scheme.split('/')[1]
  return { method, path, version }
}

function bodyParser (data, request) {
  console.log('bodyParser: data.length', data.length)
  request.body = config.contentType.forEach(type => {
    if (request.headers['content-type'] === type && config.decoder[type]) {
      return config.decoder[type](data)
    }
    return data.toString()
  })
}
