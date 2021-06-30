const express = require("express");

const authNumsPost = require("./auth-nums/post");
const authNumTokensPost = require("./auth-num-tokens/post");
const db = require("../../db");

const router = express.Router();

module.exports = router;

router.post(
  "/auth-nums",
  authNumsPost.validation(),
  authNumsPost.authNumGenerator(),
  authNumsPost.encryption(),
  authNumsPost.syncDB(db),
  authNumsPost.responder()
);

router.post(
  "/auth-num-tokens",
  authNumTokensPost.validation(),
  authNumTokensPost.encryption(),
  authNumTokensPost.validationAutNum(db),
  authNumTokensPost.tokenGenerator(),
  authNumTokensPost.syncDB(db),
  authNumTokensPost.responder()
);
