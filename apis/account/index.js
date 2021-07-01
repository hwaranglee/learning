const express = require('express');
const router = express.Router();

const authNumsPost = require('./auth-nums/post')
const authNumTokensPost = require('./auth-num-tokens')
const signupPost = require('./signup/post')
const db = require('../../db/index')

module.exports = router;

router.post('/auth-nums',
    authNumsPost.validation(),
    authNumsPost.authNumGenerator(),
    authNumsPost.encryption(),
    authNumsPost.syncDB(db),
    authNumsPost.responder()
)

router.post('/auth-num-tokens',
    authNumTokensPost.validation(),
    authNumTokensPost.encryption(),
    authNumTokensPost.validationAutNum(db),
    authNumTokensPost.tokenGenerator(),
    // JWT를 사용하였기 때문에 db에 token을 저장하지 않는다.
    // authNumTokensPost.syncDB(db),
    authNumTokensPost.responder()
)

router.post('/signup',
    signupPost.validation(),
    signupPost.tokenVerifier(),
    signupPost.passwordEncryption(), // user 별로 다른 salt 값을 갖도록
    signupPost.syncDBUser(db),
    signupPost.syncDBOptionalTerms(db),
    signupPost.responder()
)
