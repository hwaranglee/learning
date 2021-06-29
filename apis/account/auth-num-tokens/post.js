const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            if (body.type === undefined || body.key === undefined || body.authNum === undefined) {
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
            }

            // todo 정규표현식으로 string을 걸러내는 게 있을 텐데...
            // function test (ele) {
            //     if (!regExp.test(ele)) {
            //         return console.log(1)
            //     }
            //     console.log(typeof ele)
            // }
            let regExp = /^[0-9A-Za-z]{6}$/
            if (!regExp.test(body.authNum) || typeof body.authNum !== "string") {
                res.status(400)
                return res.json({code: "400_5"})
            } else {
                return console.log('error')
            }

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            // 유효성 검사가 끝난 인증번호를 다시 암호화
            req.authNumEncrypt = utils.encryption(req.body.authNum)

            next()
        }
    },

    validationAutNum: (db) => {
        return (req, res, next) => {
            // 암호화된 인증번호를 db와 비교하여 검증
            let body = req.body
            let auth = db.schema.auth
            let requestedAt = Date.now()

            let bExistence = false
            // todo for문과 if문의 중첩이라...
            for (let authPk in auth) {
                if (auth[authPk].type === body.type && auth[authPk].key === body.key) {
                    bExistence = true

                    if (requestedAt - auth[authPk].createdAt > 3 * 60 * 1000) {
                        res.status(400)
                        return res.json({code: "400_6"})
                    }

                    if (auth[authPk].authNumEncrypt !== req.authNumEncrypt) {
                        res.status(401)
                        return res.json({code: "401_1"})
                    }
                }

                req.authPk = authPk
                break
            }

            if (!bExistence) {
                res.status(404)
                return res.json({code: "404_1"})
            } else {
                return console.log("error")
            }

            next()
        }
    },

    tokenGenerator: () => {
        return (req, res, next) => {
            // JWT 생성
            req.token = jwt.sign({authPk: req.authPk}, SECRET_KEY, {expiresIn: '1h'})

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

    responder: () => {
        return (req, res) => {
            res.json({
                token: req.token
            })
        }
    }
}
