const { body, validationResult } = require("express-validator");

const std = require("../../../standards");

const { encryption, generateRandomNum } = require("../../../utils");
const { strings } = require("../../../constants");

const authNumStd = std.authNum;
const emailType = std.authNum.authNumTypeEmail;
const phoneType = std.authNum.authNumTypePhone;
const expiredMinute = std.authNum.expiredMinute;

module.exports = {
  validation: () => {
    const validChain = [
      body("type")
        .exists()
        .isIn([emailType, phoneType])
        .withMessage(strings.TYPE_ERROR),
      body("phoneNo")
        .if(body("type").isIn([phoneType]))
        .isMobilePhone("any")
        .isLength({ min: 11, max: 11 })
        .withMessage(strings.PHONE_NO_ERROR_MSG),
      body("email")
        .if(body("type").isIn([emailType]))
        .isEmail()
        .withMessage(strings.EMAIL_ERROR_MSG),
      (req, res, next) => {
        const { errors } = validationResult(req);
        if (errors.length !== 0) {
          return res.status(400).json({
            response: strings.RESPONSE_FAIL,
            msg: strings.RESPONSE_ERROR,
            errors: errors,
          });
        }
        next();
      },
    ];
    return [...validChain];
  },

  authNumGenerator: () => {
    return (req, res, next) => {
      req.authNum = generateRandomNum(authNumStd.length).toString();
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
      const expireAt = createdAt + expiredMinute * 60000;

      if (!db.schema.authNum[key]) {
        db.pk.authPk++;
      }
      db.schema.authNum[key] = {
        _id: db.pk.authPk,
        createdAt,
        expireAt,
        type,
        authNumEnc,
      };
      console.log(db.schema.authNum);
      next();
    };
  },

  responder: () => {
    return (req, res) => {
      res.status(200).json({
        response: strings.RESPONSE_SUCCESS,
        msg: strings.SUCCESS_MSG,
        authNum: req.authNum,
      });
    };
  },
};

function getKeyByType(type, body) {
  if (type === emailType) {
    return body.email;
  }
  if (type === phoneType) {
    return body.phoneNo;
  }
}
