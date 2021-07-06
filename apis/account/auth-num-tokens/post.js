const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            if (
                body.type === undefined ||
                body.key === undefined ||
                body.authNum === undefined
            ) {
                res.status(400)
                return res.json({ code: '400_2' })
            }

            if (
                body.type !== authNumStd.authNumTypeEmail &&
                body.type !== authNumStd.authNumTypePhone
            ) {
                res.status(400)
                return res.json({ code: '400_1' })
            }

            if (body.type === authNumStd.authNumTypeEmail) {
                let regExp =
                    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
                if (!regExp.test(body.key)) {
                    res.status(400)
                    return res.json({ code: '400_3' })
                }
            }

            if (body.type === authNumStd.authNumTypePhone) {
                let regExp = /^\d{3}-\d{3,4}-\d{4}$/
                if (!regExp.test(body.key)) {
                    res.status(400)
                    return res.json({ code: '400_4' })
                }
            }

            let regExp = /^[0-9A-Za-z]{6}$/
            if (
                !regExp.test(body.authNum) ||
                typeof body.authNum !== 'string'
            ) {
                res.status(400)
                return res.json({ code: '400_5' })
            }

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            req.authNumEncrypt = utils.encryption(req.body.authNum)

            next()
        }
    },

    validationAutNum: (db) => {
        return (req, res, next) => {
            let body = req.body
            let auth = db.schema.auth
            let requestedAt = Date.now()

            // ! check
            // console.log('auth: ', auth)
            // console.log('body: ', body)

            let bExistence = false
            for (let authPk in auth) {
                if (
                    auth[authPk].type === body.type &&
                    auth[authPk].key === body.key
                ) {
                    bExistence = true

                    if (
                        requestedAt - auth[authPk].createdAt >
                        authNumStd.expiredMinute * 60 * 1000
                    ) {
                        return res.status(400).json({ code: '400_6' })
                    }

                    if (auth[authPk].authNumEncrypt !== req.authNumEncrypt) {
                        return res.status(401).json({ code: '401_1' })
                    }

                    req.authPk = authPk
                    break
                }
            }

            if (!bExistence) {
                res.status(404)
                return res.json({ code: '404_1' })
            }

            next()
        }
    },

    tokenGenerator: () => {
        return (req, res, next) => {
            req.token = jwt.sign({ authPk: req.authPk }, SECRET_KEY, {
                expiresIn: `${authNumStd.tokenExpiredMinute}m`,
            })

            next()
        }
    },

    // JWT를 사용하였기 때문에 db에 token을 저장하지 않는다.
    // syncDB: (db) => {
    //     return (req, res, next) => {
    //
    //         next()
    //     }
    // },
    // source tree push test

    responder: () => {
        return (req, res) => {
            res.json({
                token: req.token,
            })
        }
    },
}
