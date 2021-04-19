const app = require('./server')
const path = require('path')

// create server should be called on instance of app object
app.createServer().listen(8000)
// app.createServer().listen(4000)
app.use(app.static(path.join(__dirname, 'public')))
/*
app.get('/lists', (req, res) => {
  req.sendResponse({ a: 1 })
}) */
