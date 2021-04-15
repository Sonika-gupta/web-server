const config = require('./config')
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
  const type = request.headers['content-type']
  if (config.decoders[type]) { request.body = config.decoders[type](data) } else { throw Error('Unsupported Content-Type') }
}

module.exports = {
  headParser,
  bodyParser
}
