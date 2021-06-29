const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body
            let emailRule = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/
            let phoneRule = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i

            if (body.type !== authNumStd.authNumTypeEmail && body.type !== authNumStd.authNumTypePhone) {
                return res.status(400).json({code: "400_1"})
            }
            //todo:필수값,데이터형태,데이터길이 체크, todo이용하기, is eamil, is는 함수 b붙이기

            if (body.type === undefined || body.key === undefined) {
                res.status(400)
                return res.json({code: "400_2"})
            }

            if (body.type === authNumStd.authNumTypeEmail) {
                if (emailRule.test(body.key) !== true) {
                    res.status(400)
                    return res.json({code: "400_3"})
                }
            } else if (body.type === authNumStd.authNumTypePhone) {
                if (phoneRule.test(body.key) !== true) {
                    res.status(400)
                    return res.json({code: "400_4"})
                }
            } else {
                return console.log("error validation")
            }

            next()
        }
    },

    authNumGenerator: () => {
        return (req, res, next) => {
            req.authNum = utils.createRandomString(authNumStd.length)

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            req.encryptNum = utils.encryption(req.authNum)

            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            let body = req.body
            let encryptNum = req.encryptNum
            let authSchema = db.schema.auth
            let authPk = db.pk.authPk
            let bAuth = false
            let createdAt = Date.now()
                //TODO:길이 유효성검사
                // TODO:if(encryptNum.length !== std.authNum.length){
                //TODO:     res.status(400).json({code: "400_5"})
                // }
                // 시간은 무조건 서버가하기,클라가 하면은 맘대로 조작될 가능성이 있음, 만약에 그렇지 않다면 유효성 검사, []안에 변수 가능, type도 호출
                // new date 보다 date now 사용

            for (let path in authSchema) {
                if (authSchema[path].key === body.key) {
                    authSchema[path].type = body.type
                    authSchema[path].createdAt = createdAt
                    authSchema[path].encryptNum = encryptNum
                    bAuth = true
                    break
                }
            }

            if (bAuth === false) {
                authSchema[authPk] = {
                    type: body.type,
                    key: body.key,
                    createdAt: createdAt,
                    authNum: encryptNum
                }
                authPk++
            }
            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.json({authNum: req.authNum})
        }
    }
}

