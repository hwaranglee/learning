const { body, validationResult } = require('express-validator')
const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum
const codes = require('../../../codes.json')

module.exports = {
    validation: () => {
        return (req, res, next) => {
            const { type, value } = req.body
            const phoneType = authNumStd.authNumTypePhone
            const emailType = authNumStd.authNumTypeEmail

            // 타입 확인
            if(type !== phoneType && type !== emailType) {
                return res.status(400).send({msg : codes["400_1"]})
            }

            // 값 유무 확인
            if(!value) {
                return res.status(400).send({msg : codes["400_2"]})
            }

            // 값 유효성 검사
            let regExp = null                   //타입에 맞는 정규표현식
            let errCode = null                  //타입에 맞는 에러 코드
            if(type === emailType) {
                regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
                errCode = "400_3"
            }
            if(type === phoneType) {
                regExp = /010-\d{4}-\d{4}$/
                errCode = "400_4"
            }

            const error = !regExp.test(req.body.value)
            if(error) return res.status(400).send({msg: codes[errCode]})

            next()
        }
    },

    authNumGenerator: () => {
        return (req, res, next) => {
            const authNum = utils.createRandomString(authNumStd.length)
            req.authNum = authNum

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            const encryptNum = utils.encryption(req.authNum)
            req.encryptNum = encryptNum

            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            const { body: { value }, encryptNum }  = req
            const existUser = db.schema.auth[value]

            //신규 유저일 때만 pk 증가
            let _id = null
            if(!existUser) {
                db.pk.authPk += 1
                _id = db.pk.authPk
            } else {
                _id = existUser._id
            }

            const authNumObj = {
                _id,
                encryptNum,
                expireAt: Date.now() + 1000 * 60 * 3
            }
            db.schema.auth[value] = authNumObj

            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.send({authNum: req.authNum})
        }
    }
}