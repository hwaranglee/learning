const express = require('express')
const bodyParser = require('body-parser')
// router
const authRouter = require('./routes/auth')

const app = express()
const port = 80

// global middlewares
app.use(bodyParser.json())
// true => qs / false => query-string
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use('/auth', authRouter)

// listen
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
