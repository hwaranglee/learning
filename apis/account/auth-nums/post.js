const { check, body, validationResult } = require('express-validator')
const { createRandomString, encryption } = require('../../../utils')
const { strings } = require('../../../constants/strings')
const { authNum } = require('../../../standards')
const { authNumTypePhone: phoneType, authNumTypeEmail: emailType, length, expiredMinute } = authNum
const codes = require('../../../codes.json')

module.exports = {
  validation: () => {
    const res = [
      // TODO 유효성 검사 추가
      check('type', codes['400_2']).not().isEmpty(),
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

    return [...res]
  },

  authNumGenerator: () => {
    return (req, res, next) => {
      // 인증번호
      req.authNum = createRandomString(length).toString()
      next()
    }
  },

  encryption: () => {
    return (req, res, next) => {
      req.encryptionAuthNum = encryption(req.authNum)
      next()
    }
  },

  syncDB: (db) => {
    return (req, res, next) => {
      const { body, encryptionAuthNum } = req
      const type = body?.type

      const createdAt = new Date()

      // pk ??
      db.schema.auth[type] = {
        createdAt: new Date(),
        expiredMinute: createdAt + expiredMinute * 60000,
        encryptionAuthNum
      }

      next()
    }
  },

  responder: () => {
    return (req, res) => {
      res.json({
        status: 200,
        res: strings.RES_SUCCESS,
        msg: strings.SEND_AUTH,
        authNum: req.authNum,
      })
    }
  }
}

