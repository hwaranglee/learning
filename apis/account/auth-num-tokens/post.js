const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body
            let authNum = body.authNum

            if (body.type === undefined || body.key === undefined || authNum === undefined) {
                return res.status(400).json({code: "400_1"})
            }
            if (body.type !== authNumStd.authNumTypePhone && body.type !== authNumStd.authNumTypeEmail) {
                return res.status(400).json({code: "400_2"})
            }
            if (typeof authNum !== "string" || authNum.length !== authNumStd.length) {
                return res.status(400).json({code: "400_5"})
            }

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            req.encryptNum = utils.encryption(req.body.authNum)

            next()
        }
    },

    validationAutNum: (db) => {
        return (req, res, next) => {
            let schema = db.schema.auth
            let AuthNum = req.encryptNum
            let body = req.body
            let minute = authNumStd.expiredMinute
            let now = Date.now()
            let bAuthNum = false

            //todo: db안에 인증번호가 없을때와 있긴한데 틀릴때를 구분해줘야할까

            for (let authPk in schema){
                if (schema[authPk].type === body.type && schema[authPk].key === body.key) {
                    if ([now - schema[authPk].createdAt] / 60000 > minute) {
                        return res.status(400).json({code: "400_6"})
                    }
                    if(schema[authPk].encryptNum === undefined) {
                        return res.status(404).json({code: "404_1"})
                    }
                    if (schema[authPk].encryptNum !== AuthNum) {
                        return res.status(401).json({code: "401_1"})
                    }else{
                        bAuthNum = true
                        break
                    }
                }
            }

            if (bAuthNum === false){
                if (body.type === authNumStd.authNumTypePhone) {
                    return res.status(400).json({code: "400_4"})
                }else if (body.type === authNumStd.authNumTypeEmail) {
                    return res.status(400).json({code: "400_3"})
                }
            }

            next()
        }
    },

    tokenGenerator: () => {
        return (req, res, next) => {
            req.tokenNum = utils.createRandomString(authNumStd.tokenLength)

            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            let body = req.body
            let tokenNum = req.tokenNum
            let tokenSchema = db.schema.authToken
            let tokenPk = db.pk.authTokenPk
            let createdAt = Date.now()
            let bToken = false

            for (let pk in tokenSchema) {
                if(body.type === tokenSchema[pk].type && body.key === tokenSchema[pk].key){
                    tokenSchema[pk].tokenNum = tokenNum
                    tokenSchema[pk].createdAt = createdAt
                    bToken = true
                    break
                }
            }

            if (bToken === false) {
                tokenSchema[tokenPk] = {
                    type: body.type,
                    key: body.key,
                    tokenNum: tokenNum,
                    createdAt: createdAt,
                    tokenExpiredMinute: authNumStd.tokenExpiredMinute
                }
                tokenPk++
            }


            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.json({
                token: req.token
            })
        }
    }
}
