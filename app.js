const express = require('express')
const bodyParser = require('body-parser')

const utils = require('./utils')
let db = require('./db')

const authNumsPost = require('./apis/account/auth-nums/post')
const authNumTokensPost = require('./apis/account/auth-num-tokens/post')

// settings
const app = express()
const port = 3000

// global middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));

// listen
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

// apis
app.post('/auth-nums',
    authNumsPost.validation(),
    authNumsPost.authNumGenerator(),
    authNumsPost.encryption(),
    authNumsPost.syncDB(db),
    authNumsPost.responder()
)

app.post('/auth-num-tokens',
    authNumTokensPost.validation(),
    authNumTokensPost.encryption(),
    authNumTokensPost.validationAutNum(db),
    authNumTokensPost.tokenGenerator(),
    // JWT를 사용하였기 때문에 db에 token을 저장하지 않는다.
    // authNumTokensPost.syncDB(db),
    authNumTokensPost.responder()
)
