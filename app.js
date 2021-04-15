const app = require('./server')
const path = require('path')

app.createServer().listen(8000)
app.setStatic(path.join(__dirname, 'public'))
