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
  let contentLength, headerLength
  const request = {}
  socket.once('data', (chunk) => {
    console.log('chunked')
    buffer = Buffer.concat([buffer, chunk])
    requestHandler(chunk.toString(), request, headerLength)
    contentLength = request.headers['content-length']
    console.log(`\n\nrequired length: ${contentLength},${headerLength} \n\n`)
  })
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk])
    console.log('adding to buffer', chunk.length, buffer.length)
    setTimeout(() => {
      if (buffer.length > contentLength) {
        console.log('sending to parse', buffer.length, buffer.toString().length)
        requestHandler(buffer.toString(), request)
        const response = generateResponse(request)
        console.log('\n\nresponding', response.toString())
        socket.write(response)
        socket.emit('end')
      }
    }, 2000)
  })

  socket.on('end', () => {
    console.log('\n\n-----End------', buffer.length)
  })
/*
  socket.on('error', e => {
    console.log('!!', e)
    socket.write(generateResponse(request, e.code))
  }) */
}

function requestHandler (message, request, headerLength) {
  console.log('message received: ', message.length)
  let marker
  if (!request.headers) {
    console.log('parsing headers')
    marker = message.indexOf('\r\n\r\n')
    if (marker === -1) {
      throw Error('Incomplete Headers?')
    } else {
      const head = message.split('\r\n\r\n')[0]
      headerLength = head.length
      const [startLine, ...headerLines] = head.split('\r\n')
      const headers = getHeaders(headerLines)
      Object.assign(request, {
        ...parseStartLine(startLine),
        headers
      })
    }
  } else {
    const remaining = message.slice(marker)
    console.log('parsing body', remaining.length)
    request.body = bodyParser(remaining, request.headers)
  }
}

function getHeaders (lines) {
  const headers = {}
  lines.forEach(line => {
    const [key, value] = line.split(':')
    headers[key.toLowerCase()] = value.trim()
  })
  return headers
}

function parseStartLine (startLine) {
  const [method, path, scheme] = startLine.trim().split(' ')
  const version = scheme.split('/')[1]
  return { method, path, version }
}

function bodyParser (data, headers) {
  console.log('parsing body', data.length)
  const body = config.contentType.forEach(type => {
    if (headers['content-type'] === type && config.decoder[type]) {
      return config.decoder[type](data)
    }
    return data.toString()
  })
  return body
}
