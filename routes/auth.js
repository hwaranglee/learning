const express = require('express')
const router = express.Router()
const db = require('../db')
const authNumsPost =
  require('../apis/account/auth-nums/post')
const authNumTokensPost = require('../apis/account/auth-num-tokens/post')

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
  authNumTokensPost.syncDB(db),
  authNumTokensPost.responder()
)

module.exports = router