const express = require('express');
const router = express.Router();

const db = require('../../db/index')

const authNumsPost = require('./auth-nums/post')
const authNumTokensPost = require('./auth-num-tokens/post')
const accountsPost = require('./accounts/post')
// validator 연습용
const validatorPost = require('./validator/post')

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

router.post('/accounts',
    accountsPost.validation(),
    accountsPost.tokenVerifier(),
    accountsPost.passwordEncryption(), // user 별로 다른 salt 값을 갖도록
    accountsPost.syncDBUser(db),
    accountsPost.syncDBOptionalTerms(db),
    accountsPost.responder()
)

// validator 연습용
router.post('/validator',
    validatorPost.validation(),
    validatorPost.responder()
)
