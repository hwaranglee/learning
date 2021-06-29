const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            if (body.type === undefined || body.key === undefined) {
                res.status(400)
                return res.json({code: "400_2"})
            }

            if (body.type !== authNumStd.authNumTypeEmail || body.type !== authNumStd.authNumTypePhone) {
                res.status(400)
                return res.json({code: "400_1"})
            }

            if (body.type === authNumStd.authNumTypeEmail) {
                let regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
                if (!regExp.test(body.key)) {
                    res.status(400)
                    return res.json({code: "400_3"})
                }
            }

            if (body.type === authNumStd.authNumTypePhone) {
                let regExp = /^\d{3}-\d{3,4}-\d{4}$/
                if (!regExp.test(body.key)) {
                    res.status(400)
                    return res.json({code: "400_4"})
                }
            } else {
                console.log('error')
            }
            // todo 개발자에게 메일/문자 보내기

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
            req.authNumEncrypt = utils.encryption(req.authNum)

            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            let body = req.body
            let auth = db.schema.auth
            let pk = db.pk

            let bExistence = false
            // auth = {
            //     1: {
            //         authNumEncrypt: '',
            //         key: ''
            //     }
            // }
            for (let authPk in auth) {
                // type 까지
                if (auth[authPk].type === body.type && auth[authPk].key === body.key) {
                    bExistence = true
                    auth[authPk].authNumEncrypt = req.authNumEncrypt
                    auth[authPk].createdAt = Date.now()
                    break
                }
            }

            if (!bExistence) {
                auth[pk.authPk] = {
                    authNumEncrypt: req.authNumEncrypt,
                    key: body.key,
                    type: body.type,
                    createdAt: new Date()
                }
                pk.authPk++
            } else {
                console.log('error')
            }
            // 개발자에게 메일/문자 보내기

            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.json({authNum: req.authNum})
            // res.status(201).json({authNum: req.authNum})
        }
    }
}

