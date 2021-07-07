const express = require("express");

const authNumsPost = require("./auth-nums/post");
const authNumTokensPost = require("./auth-num-tokens/post");
const signUpPost = require("./sign-up/post");
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
  authNumTokensPost.validationAuth(db),
  authNumTokensPost.tokenGenerator(),
  authNumTokensPost.responder()
);

router.post(
  "/sign-up",
  signUpPost.validation(),
  signUpPost.encryption(),
  signUpPost.syncDB(db),
  signUpPost.responder()
);
