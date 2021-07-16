const express = require('express')
const router = express.Router()

const db = require('../../db/index')

const authNumsPost = require('./auth-nums/post')
const authNumTokensPost = require('./auth-num-tokens/post')
const usersPost = require('./users/post')
// validator 연습용
const validatorPost = require('./validator/post')

module.exports = router

router.post(
    '/auth-nums',
    authNumsPost.validation(),
    authNumsPost.authNumGenerator(),
    authNumsPost.encryption(),
    authNumsPost.syncDB(db),
    authNumsPost.responder(),
)

router.post(
    '/auth-num-tokens',
    authNumTokensPost.validation(),
    authNumTokensPost.encryption(),
    authNumTokensPost.validationAutNum(db),
    authNumTokensPost.tokenGenerator(),
    // JWT를 사용하였기 때문에 db에 token을 저장하지 않는다.
    // authNumTokensPost.syncDB(db),
    authNumTokensPost.responder(),
)

router.post(
    '/users',
    (req, res, next) => {
        console.log(req.headers)
        next()
    },
    usersPost.validation(),
    usersPost.tokenVerifier(),
    usersPost.passwordEncryption(),
    usersPost.syncDBUserAuthToken(db),
    usersPost.syncDBOptionalTerms(db),
    usersPost.responder(),
)

// validator 연습용
router.post('/validator', validatorPost.validation(), validatorPost.responder())

// 테스트용
router.post('/test', (req, res, next) => {
    const ip = req.header['x-forwarded-for'] || req.connection.remoteAddress
    console.log('ip: ', ip)
    console.log('user-agent: ', req.headers['user-agent'])
    res.json('hello')
})
