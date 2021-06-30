const { check, body, validationResult } = require('express-validator')

const { createRandomString, encryption } = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum
const phoneType = authNumStd.authNumTypePhone
const emailType = authNumStd.authNumTypeEmail
const expiredMinute = authNumStd.expiredMinute
const codes = require('../../../codes.json')

module.exports = {
  validation: () => {
    const chain = [
      check('type')
        .exists()
        .isIn([phoneType, emailType])
        .withMessage(codes['400_1']),
      check('email')
        .if(body('type').isIn([emailType]))
        .isEmail()
        .withMessage(codes['400_3']),
      check('phone')
        .if(body('type').isIn([phoneType]))
        .isMobilePhone('any')
        .isLength({ min: 10, max: 11 })
        .withMessage(codes['400_4']),
      (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
        }
        next()
      }
    ]

    return [...chain]
  },

  authNumGenerator: () => {
    return (req, res, next) => {
      req.authNum = createRandomString(authNumStd.length).toString();
      next()
    }
  },

  encryption: () => {
    return (req, res, next) => {
      console.log(req.authNum)
      next()
    }
  },

  syncDB: (db) => {
    return (req, res, next) => {

      next()
    }
  },

  responder: () => {
    return (req, res) => {
      res.json({ authNum: req.authNum })
    }
  }
}

