const { body, validationResult } = require("express-validator");

const std = require("../../../standards");

const { encryption, generateRandomNum } = require("../../../utils");
const { strings } = require("../../../constants");
const authNumStd = std.authNum;

module.exports = {
  validation: () => {
    const validChain = [
      body("phoneNo").isMobilePhone("any").isLength({ min: 11, max: 11 }),
      (req, res, next) => {
        const { errors } = validationResult(req);
        if (errors.length !== 0) {
          return res.status(400).json({
            response: strings.RESPONSE_FAIL,
            msg: strings.PHONE_NO_ERROR_MSG,
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
      req.authNum = generateRandomNum(authNumStd.length);
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
      const { authNumEnc } = req;
      db.schema.authNum[req.body.phoneNo] = {
        createdAt: Date.now(),
        authNumEnc,
      };
      console.log(db);
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
