const server = require('./server')
const path = require('path')
const app = server()
app.listen(8000)
app.use(app.static(path.join(__dirname, 'public')))

app.get('/lists', (req, res) => {
  console.log(req, res)
  // req.sendResponse({ a: 1 })
})
