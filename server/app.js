const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const authRouter = require('./apis')

const app = express()
app.use(cors())
const port = 8080

// global middlewares
app.use(bodyParser.json())
// true => qs / false => query-string
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use('/api', authRouter)

// listen
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
