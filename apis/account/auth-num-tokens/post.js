const { body } = require("express-validator");
const { sign } = require("jsonwebtoken");
require("dotenv").config();

const { encryption } = require("../../../utils");
const { getKeyByType } = require("../../../utils/account");
const { validationErrorHandler } = require("../../../validator/auth-num");
const { authNumValidator } = require("../../../validator/auth-num");
const { authNum } = require("../../../standards");
const { strings } = require("../../../constants");

const JWT_KEY = process.env.JWT_SECRET;

module.exports = {
  validation: () => {
    const validChain = [
      ...authNumValidator,
      body("authNum")
        .exists()
        .isLength({
          min: authNum.length,
          max: authNum.length,
        })
        .withMessage(strings.AUTH_NO_ERROR_MSG),
      validationErrorHandler,
    ];

    return [...validChain];
  },

  encryption: () => {
    return (req, res, next) => {
      const { body } = req;
      req.authNumEnc = encryption(body.authNum);

      next();
    };
  },

  validationAuth: (db) => {
    return (req, res, next) => {
      const { authNumEnc, body } = req;
      const { type } = body;
      const key = getKeyByType(type, body);
      const row = db.schema.authNum[key];

      if (row === undefined) {
        return res.status(404).json({
          response: strings.RESPONSE_ERROR,
          msg: strings.NOT_FOUND_AUTH_ROW_ERROR_MSG,
        });
      } else {
        const { expiredAt, type: compareType, authNumEnc: compareNum } = row;

        // ? expireAt check
        if (expiredAt > Date.now()) {
          return res.status(400).json({
            response: strings.RESPONSE_ERROR,
            msg: strings.EXPIRE_TIME_ERROR_MSG,
          });
        }

        // ? type check
        if (compareType !== type) {
          return res.status(400).json({
            response: strings.RESPONSE_ERROR,
            msg: strings.NOT_MATCH_AUTH_TYPE_ERROR_MSG,
          });
        }

        // ? authNum check
        if (compareNum !== authNumEnc) {
          return res.status(400).json({
            response: strings.RESPONSE_ERROR,
            msg: strings.NOT_MATCH_AUTH_NUM_ERROR_MSG,
          });
        }
      }
      req.key = key;

      next();
    };
  },

  tokenGenerator: () => {
    return (req, res, next) => {
      // ? payload 안에 key 외에도 type 등 검증로직
      req.token = sign(
        {
          key: req.key,
        },
        JWT_KEY,
        { expiresIn: `${authNum.tokenExpiredMinute}m` }
      );

      next();
    };
  },

  responder: () => {
    return (req, res) => {
      return res.status(200).json({
        response: strings.RESPONSE_SUCCESS,
        msg: strings.SUCCESS_MSG,
        token: req.token,
      });
    };
  },
};
