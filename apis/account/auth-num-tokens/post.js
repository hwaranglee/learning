const jwt = require('jsonwebtoken')
const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum
const codes = require('../../../codes.json')
require('dotenv').config()

module.exports = {
    validation: (db) => {
        return (req, res, next) => {
            const { value, authNum } = req.body

            // 값 유무 확인
            if(value === undefined || authNum === undefined) {
                return res.status(400).send({msg : codes["400_2"]})
            }

            // 인증 번호 길이 확인
            if(authNum.length !== authNumStd.length) {
                return res.status(400).send({msg : codes["400_5"]})
            }

            // 인증 객체 존재 확인
            const existAuthObj = db.schema.auth[value]
            if(!existAuthObj) {
                return res.status(404).send({msg : codes["404_1"]})
            }

            // 유효 시간 확인
            if(existAuthObj.expireAt <= Date.now()) {
                return res.status(400).send({msg : codes["400_6"]})
            }

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            const encryptNum = utils.encryption(req.body.authNum)
            req.encryptNum = encryptNum

            next()
        }
    },

    validationAuthNum: (db) => {
        return (req, res, next) => {
            const {body: {value}, encryptNum} = req
            const authObj = db.schema.auth[value]

            if (authObj.encryptNum !== encryptNum) {
                return res.status(401).send({msg : codes["401_1"]})
            }

            next()
        }
    },

    tokenGenerator: () => {
        return (req, res, next) => {
            const { value } = req.body

            req.token = jwt.sign({ value }, process.env.SHA_AT, {
                expiresIn: authNumStd.tokenExpiredSecond,
            });

            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            const {body: {value}, token} = req
            const existToken = db.schema.authToken[value]

            // 신규 유저일 때만 pk 증가
            let _id = null
            if(!existToken) {
                authNumStd.pk.authTokenPk += 1
                _id = authNumStd.pk.authTokenPk
            } else {
                _id = existToken._id
            }

            const authTokenObj = {
                _id,
                token
            }

            db.schema.authToken[value] = authTokenObj

            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.send({token: req.token})
        }
    }
}
