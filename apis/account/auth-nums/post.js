const { getKeyByType } = require("../../../utils/account");
const { validationErrorHandler } = require("../../../validator/auth-num");

const { authNum } = require("../../../standards");
const { authNumValidator } = require("../../../validator/auth-num");

const { encryption, generateRandomNum } = require("../../../utils");
const { strings } = require("../../../constants");

const { expiredMinute, length: authNumLength } = authNum;

module.exports = {
  validation: () => {
    const validChain = [...authNumValidator, validationErrorHandler];
    return [...validChain];
  },

  authNumGenerator: () => {
    return (req, res, next) => {
      req.authNum = generateRandomNum(authNumLength).toString();

      next();
    };
  },

  encryption: () => {
    return (req, res, next) => {
      req.authNumEnc = encryption(req.authNum);

      next();
    };
  },

  syncDB: (db) => {
    return (req, res, next) => {
      const { authNumEnc, body } = req;
      const { type } = body;

      const key = getKeyByType(type, body);
      const createdAt = Date.now();
      const expiredAd = createdAt + expiredMinute * 60000;

      db.schema.authNum[key] = {
        createdAt,
        expiredAd,
        type,
        authNumEnc,
      };

      next();
    };
  },

  responder: () => {
    return (req, res) => {
      return res.status(200).json({
        response: strings.RESPONSE_SUCCESS,
        msg: strings.SUCCESS_MSG,
        authNum: req.authNum,
      });
    };
  },
};
