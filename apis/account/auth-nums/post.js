const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body
            let emailRule = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/
            let phoneRule = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/

            if(body.type !== authNumStd.authNumTypeEmail && body.type !== authNumStd.authNumTypePhone){
                res.status(400)
                return res.json({code: "400_1"})
            }
//필수값,데이터형태,데이터길이 체크

            if(body.type === undefined || body.key === undefined){
                res.status(400)
                return res.json({code: "400_2"})
            }

            if(body.type === authNumStd.authNumTypeEmail){
                if(emailRule.test(body.key) !== true){
                    res.status(400)
                   return res.json({code: "400_3"})
                }
            }

            else if(body.type === authNumStd.authNumTypePhone){
                if(phoneRule.test(body.key) !== true){
                    res.status(400)
                    return res.json({code: "400_4"})
                }
            }

            else{
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
            let checking = false
            //길이 유효성검사
            // if(encryptNum.length !== std.authNum.length){
            //     res.status(400).json({code: "400_5"})
            // }

            for(let path in authSchema){
                if(authSchema[path].key === body.key){
                    authSchema[path].createdAt = body.createdAt
                    authSchema[path].encryptNum = encryptNum
                    checking = true
                    break
                }
            }
//1:[type ,key, createdat]

            if(checking === false) {
                authSchema[authPk] = {
                    type: body.type,
                    key: body.key,
                    createdAt: body.createdAt,
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

