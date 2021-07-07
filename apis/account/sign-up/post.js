const { decode } = require("jsonwebtoken");

const { encryption } = require("../../../utils");
const {
  signUpValidator,
  validationErrorHandler,
} = require("../../../validator/sign-up");
const { strings } = require("../../../constants");

module.exports = {
  validation: () => {
    const validChain = [
      ...signUpValidator,
      validationErrorHandler,
      (req, res, next) => {
        const { body } = req;
        const { token } = body;
        console.log(decode(token));

        next();
      },
    ];
    return [...validChain];
  },

  encryption: () => {
    return (req, res, next) => {
      const { body } = req;
      req.encPassword = encryption(body.password);

      next();
    };
  },

  syncDB: (db) => {
    return (req, res, next) => {
      // const { authNumEnc, body } = req;
      // const { type } = body;
      //
      // const key = getKeyByType(type, body);
      // const createdAt = Date.now();
      // const expiredAd = createdAt + expiredMinute * 60000;
      //
      // db.schema.authNum[key] = {
      //   createdAt,
      //   expiredAd,
      //   type,
      //   authNumEnc,
      // };

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
