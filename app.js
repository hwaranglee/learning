const express = require('express')
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express')
require('dotenv').config()

const accountRouter = require('./apis/account/index')
const spec = require('./swagger/spec')

// settings
const app = express()
const port = 3000

// global middlewares
app.use(bodyParser.json())
// 사실 bodyParser를 쓰지 않고 다음과 같이 express의 메소드를 사용해도 된다.
// app.use(express.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
)

// listen
if (process.env.NODE_ENV === 'development') {
    app.listen(port, () => {
        console.log(
            `👍 Example app listening at http://localhost:${port}\n😎 NODE_ENV = ${process.env.NODE_ENV}`,
        )
    })
} else {
    console.log('👀 WARNING! NODE_ENV !== development')
}

app.use('/account', accountRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }))
