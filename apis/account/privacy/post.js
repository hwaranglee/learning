const { body, validationResult } = require('express-validator')

const utils = require('../../../utils')
const std = require('../../../standards')
const strings = require('../../../strings')


const KO = std.country.KO
const US = std.country.US
const ko = std.language.ko
const en = std.language.en

const signUp = strings.signUp
const userStd = std.user
//let { id, password, rePassword, name, email, phone, country, language } = req.body

module.exports = {
    // 유저가 아이디, 비번, 이름, 전화번호, 국가, 언어 등의 기본정보 입력
    validation: (db) => {
        let validChain = [
            body("id")
                .exists()
                .isLength({ min: 8, max: 20 })
                .withMessage(signUp.ID_ERROR_MSG),
            body("password")
                .exists()
                .withMessage(signUp.PASSWORD_ERROR_MSG)
                .isStrongPassword()
                .isLength({ min: userStd.passwordMinLength , max: userStd.passwordMaxLength})
                .withMessage(signUp.PASSWORD_LENGTH_MSG),
            body("name")
                .exists()
                .isLength({ min: 1, max: 30 })
                .withMessage(signUp.NAME_ERROR_MSG),
            body("country")
                .exists()
                .isIn([KO, US])
                .withMessage(signUp.COUNTRY_ERROR_MSG),

            (req, res, next, resolve, reject) => {
                const {errors} = validationResult(req)
                if (!errors || errors.length === 0) {
                    next()
                } else {
                    res.status = 400
                    return res.json({
                        code: ""
                    })
                }
            }
        ]
        return [...validChain]
    },

    // 헤더에 저장된 토큰을 암호화
    tokenEncryption: () => {
        return (req, res, next) => {
            let token = req.headers.token
            req.encryptionToken = utils.encryption(token)

            next()
        }
    },

    // 암호화된 토큰을 db에 저장된 유저 정보에 있는 토큰과 비교하여 유효성 검증
    validationToken: (db) => {
        return (req, res, next) => {
            const body = req.body
            const authToken = db.schema.authToken
            let bSearched = false
            let auth = req.auth = {}

            for (let pk in authToken) {
                let searchedAuthToken = authToken[pk]

                if (searchedAuthToken.token === req.encryptedToken) {
                    bSearched = true
                    auth.key = searchedAuthToken.key
                    auth.type = searchedAuthToken.type
                    break
                }
            }

            if (bSearched === false) {
                return res.status(401).json({code: "401_2"})
            }

            next()
        }
    },

    passwordEncryption: () => {
        return (req, res, next) => {
            let body = req.body
            req.encryptionPassword = utils.encryption(body.password)

            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            const authNumStd = std.authNum
            const body = req.body
            const auth = req.auth

            let user = db.schema.user
            let optionalTerms = db.schema.optionalTerms
            let dbPk = db.pk

            user[dbPk.userPk] = {
                id: body.id,
                password: req.encryptedPassword,
                gender: body.gender,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }

            if (auth.type === authNumStd.authNumTypeEmail) {
                user[dbPk.userPk].email = auth.key
            } else if (auth.type === authNumStd.authNumTypePhone) {
                user[dbPk.userPk].phone = auth.key
            }

            if (body.optionalTerms.length > 0) {
                optionalTerms[dbPk.optionalTermsPk++] = {
                    userId: body.id,
                    values: body.optionalTerms
                }
            }

            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.status(201).json({})
        }
    }
}
