const config = require('./config')
function parseheaders (head) {
  console.log('parseheaders: head.length', head.length)
  const headers = {}
  head.split('\r\n').forEach(line => {
    const [key, value] = line.split(':')
    headers[key.toLowerCase()] = value.trim()
  })
  return headers
}

function parseStartLine (startLine) {
  const [method, path, scheme] = startLine.trim().split(' ')
  const version = scheme.split('/')[1]
  const error = new Error()
  if (!config.methods.includes(method)) {
    error.code = 501
    throw error
  }
  if (+version > config.version) {
    error.code = 505
    throw error
  }
  return { method, path, version }
}

function bodyParser (request, response) {
  console.log('bodyParser: data.length:', request.body.length)
  // if required content-length and not found -> 411
  if (!request.body.length || request.method === 'GET' || request.method === 'HEAD') return

  const type = request.headers['content-type'].split('; ')
  // type[1].split('=')[1]
  if (config.parsers[type[0]]) {
    request.body = config.parsers[type[0]](request.body)
  } else {
    response.statusCode = 415
    response.error = true
    request.sendResponse(response)
    return true
  }
}

module.exports = {
  parseStartLine,
  parseheaders,
  bodyParser
}
