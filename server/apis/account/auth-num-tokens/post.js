const { check, body, validationResult } = require('express-validator')
const { createRandomString, encryption, getValueByType, generateToken } = require('../../../utils')
const codes = require('../../../codes.json')
const { strings } = require('../../../constants/strings')
const { authNum } = require('../../../standards')
const { authNumTypePhone: phoneType, authNumTypeEmail: emailType, length, expiredMinute } = authNum


module.exports = {
  validation: () => {
    const res = [
      // TODO 유효성 검사 추가
      check('type', codes['400_2']).not().isEmpty(),
      check('authNum', codes['400_2']).not().isEmpty(),
      check('email', codes['400_2']).if(body('type').isIn([emailType])).not().isEmpty(),
      check('phone', codes['400_2']).if(body('type').isIn([phoneType])).not().isEmpty(),
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


  encryption: () => {
    return (req, res, next) => {
      req.encryptionAuthNum = createRandomString(req.authNum)
      next()
    }
  },

  validationAutNum: (db) => {
    return (req, res, next) => {
      const typeValue = getValueByType(req.body)
      const { authNum } = req.body
      const row = db.schema.auth[typeValue]

      // row 없을때
      if (row === undefined) {
        res.status(400).json({
          res: strings.RES_FAILED,
          msg: 'row 없음',
        })
      } else {
        const { encryptionAuthNum, expiredAt } = row

        // 인증번호 유효 시간
        if (new Date() > expiredAt) {
          res.status(400).json({
            res: strings.RES_FAILED,
            msg: codes['400_6']
          })
        }

        // 인증번호 확인
        if (encryptionAuthNum !== encryption(authNum)) {
          res.status(401).json({
            res: strings.RES_FAILED,
            msg: codes['401_1'],
          })
        }

      }
      req.tokenKey = typeValue
      // TODO
      // "400_5": "잘못된 인증번호이다.",
      // "404_1": "인증중인 값이 없습니다."
      next()
    }
  },

  tokenGenerator: () => {
    return (req, res, next) => {
      req.token = generateToken(req.tokenKey)
      next()
    }
  },

  syncDB: (db) => {
    return (req, res, next) => {
      const { token, tokenKey } = req
      let row = db.schema.authToken

      row = {
        token: encryption(token),
        key: tokenKey,
        createdAt: new Date()
      }

      console.log(row)
      next()
    }
  },

  responder: () => {
    return (req, res) => {
      res.status(200).json({
        res: strings.RES_SUCCESS,
        msg: strings.AUTH_SUCCESS,
        token: req.token
      })
    }
  }
}
