const utils = require('../../../utils')
const std = require('../../../standards')

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

            if (body.type === authNumStd.authNumTypePhone) {
                regExp = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/;
                code = '400_4'
            } else if (body.type === authNumStd.authNumTypeEmail) {
                regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                code = '400_3'
            } else {
                console.log("type error입니다.")
            }

            if (regExp !== null) {
                const isValidKey = RegExp.error(body.key)

                if (!isValidKey) {
                    res.status = 400
                    return res.json({code: code})
                }
            } else {
                console.log("type error입니다.")
            }

            // 6자리 맞는 지 인증번호 정규식으로 유효성체크
            //todo 숫자로만 이루어져도 문자열로 체크... 문자열 못잡아냄.
            let regex = new RegExp("^[a-zA-Z0-9]{" + std.authNum.length + "}$")
            let isAuthNumValidKey = regex.test(body.authNum)

            if (isAuthNumValidKey !== undefined && typeof isAuthNumValidKey === "string") {
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
            let isSearched = false
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
                    isSearched = true
                    break
                }
            }

            // 인증 존재 체크
            if (!isSearched) {
                res.status = 404
                return res.json({code: '404_1'})
            }

            // 인증 번호 체크
            const authNum = req.body.authNum
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

    syncDB: (db) => {
        return (req, res, next) => {
            let body = req.body
            let encryptedToken = utils.encryption(req.token)  // 서버에서 token 암호화
            let authToken = db.schema.authToken

            //todo 토큰값이 중복되면...?
            //todo 토큰은 로그인할때마다 새로 발행되는건가요?
            authToken[encryptedToken] = {
                key: body.key,
                type: body.type,
                createdAt: Date.now()   //db에 token 저장
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
