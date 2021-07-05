const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const accountRouter = require('./apis/account/index')

// settings
const app = express()
const port = 3000

// global middlewares
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
)

// listen
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.use('/account', accountRouter)
