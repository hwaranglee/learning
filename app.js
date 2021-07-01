const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const utils = require('./utils')
// let db = require('./db')

const authNumsPost = require('./apis/account/auth-nums/post')
const authNumTokensPost = require('./apis/account/auth-num-tokens/post')
const signupPost = require('./apis/account/signup/post')
const accountRouter = require('./apis/account/index')

// settings
const app = express()
const port = 3000

// global middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// listen
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.post('/postmanTest',
    (req, res) => {
        res.json({msg: 'HELLO'})
    }
)

app.use('/account', accountRouter)
// apis
// app.post('/auth-nums',
//     authNumsPost.validation(),
//     authNumsPost.authNumGenerator(),
//     authNumsPost.encryption(),
//     authNumsPost.syncDB(db),
//     authNumsPost.responder()
// )
//
// app.post('/auth-num-tokens',
//     authNumTokensPost.validation(),
//     authNumTokensPost.encryption(),
//     authNumTokensPost.validationAutNum(db),
//     authNumTokensPost.tokenGenerator(),
//     // JWT를 사용하였기 때문에 db에 token을 저장하지 않는다.
//     // authNumTokensPost.syncDB(db),
//     authNumTokensPost.responder()
// )
//
// app.post('/signup',
//     signupPost.validation(),
//     signupPost.tokenVerifier(),
//     signupPost.passwordEncryption(), // user 별로 다른 salt 값을 갖도록
//     signupPost.syncDBUser(db),
//     signupPost.syncDBOptionalTerms(db),
//     signupPost.responder()
// )