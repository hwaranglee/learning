const utils = require('../../../utils')
const std = require('../../../standards')
const str = require('../../../strings')

const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            if (body.type === undefined || body.key === undefined || body.authNum === undefined) {
                res.status = 400
                return res.json({code: '400_2'})
            }

            if (body.type !== authNumStd.authNumTypePhone && body.type !== authNumStd.authNumTypeEmail) {
                res.status = 400
                return res.json({code: '400_1'})
            }

            let regExp = null
            let code = null
            const signUp = str.signUp

            if (body.type === authNumStd.authNumTypePhone) {
                regExp = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/;
                code = '400_4'
            } else if (body.type === authNumStd.authNumTypeEmail) {
                regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                code = '400_3'
            } else {
                console.log(signUp.TYPE_ERROR)
            }

            if (regExp !== null) {
                const isValidKey = regExp.test(body.key)

                if (isValidKey === false) {
                    res.status = 400
                    return res.json({code: code})
                }
            } else {
                console.log(signUp.ERROR)
            }

            // 6자리 맞는지 인증번호 정규식으로 유효성체크
            regExp = new RegExp("^[a-zA-Z0-9]{" + std.authNum.length + "}$")
            let isAuthNumValidKey = regExp.test(body.authNum)

            if (isAuthNumValidKey === false) {
                res.status = 400
                return res.json({code: "400_5"})
            }

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            let body = req.body
            req.encryptionNum = utils.encryption(body.authNum)

            next()
        }
    },

    validationAuthNum: (db) => {
        return (req, res, next) => {
            let body = req.body
            let auth = db.schema.auth
            let bSearched = false
            let searchedPk = 1

            for (let pk in auth) {
                let data = auth[pk]

                if (data.key === body.key && data.type === body.type) {
                    let now = Date.now()
                    const cal = data.createdAt + std.authNum.expiredMinute * 60000

                    // 유효시간 체크
                    if (now > cal) {
                        res.status = 400
                        return res.json({code: '400_6'})
                    }
                    searchedPk = pk
                    bSearched = true
                    break
                }
            }

            // 인증 존재 체크
            if (!bSearched) {
                res.status = 404
                return res.json({code: '404_1'})
            }

            // 인증 번호 체크
            const authNum = body.authNum
            const encryptedAuthNum = utils.encryption(authNum)
            const savedAuthNum = auth[searchedPk].authNum
            if (encryptedAuthNum !== savedAuthNum) {
                res.status = 401
                return res.json({code: '401_1'})
            }

            next()
        }
    },

    tokenGenerator: () => {
        return (req, res, next) => {
            let authNumStd = std.authNum
            req.token = utils.createRandomString(authNumStd.tokenLength)

            next()
        }
    },

    encryptionToken: () => {
        return (req, res, next) => {
            req.encryptedToken = utils.encryption(req.token)  // 서버에서 token 암호화

            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            let body = req.body
            let authToken = db.schema.authToken
            let bSearched = false
            const dbPk = db.pk

            for (let pk in authToken) {
                let searchedAuthToken = authToken[pk]

                if (searchedAuthToken.type === body.type && searchedAuthToken.key === body.key) {
                    bSearched = true
                    searchedAuthToken.token = req.encryptedToken
                    searchedAuthToken.createdAt = Date.now()
                    break
                }
            }

            if (bSearched === false) {
                authToken[dbPk.authTokenPk++] = {
                    token: req.encryptedToken,
                    key: body.key,
                    type: body.type,
                    createdAt: Date.now()   //db에 token 저장
                }
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
