const { body, validationResult } = require('express-validator')

const utils = require('../../../utils')
const std = require('../../../standards')
const strings = require('../../../strings')

const KO = std.country.KO
const US = std.country.US
const ko = std.language.ko
const en = std.language.en

const signUp = strings.signUp
//let { id, password, rePassword, name, email, phone, country, language } = req.body

module.exports = {
    // 유저가 아이디, 비번, 이름, 전화번호, 국가, 언어 등의 기본정보 입력
    validation: () => {
        let validChain = [
            body("id")
                .exists()
                .isLength({ min: 8, max: 20 })
                .withMessage(signUp.ID_ERROR_MSG),
            // todo id 중복체크
            body("password")
                .exists()
                .withMessage(signUp.PASSWORD_ERROR_MSG)
                .isStrongPassword()
                .isLength({ min: 8 , max: 20})
                .withMessage(signUp.PASSWORD_LENGTH_MSG),
            body("rePassword")
                .exists()
                .isStrongPassword()
                // todo 처음 password와 다른 password 입력했을 때 오류 나는 것 문법 모르곘습니다.
                .if(!body("Password"))
                .withMessage(signUp.RePASSWORD_ERROR_MSG),
            body("name")
                .exists()
                .isLength({ min: 1, max: 30 })
                .withMessage(signUp.NAME_ERROR_MSG),
            body("email")
                .exists()
                .isEmail()
                .isLength({ min: 5, max: 30 })
                .withMessage(signUp.EMAIL_ERROR_MSG),
            // todo 이메일 중복 체크
            body("phone")
                .exists()
                .isMobilePhone("any")
                .isLength({ min: 11, max: 11 })
                .withMessage(signUp.PHONE_NO_ERROR_MSG),
            body("country")
                .exists()
                .if(body("country").isIn([KO, US]))
                .withMessage(signUp.COUNTRY_ERROR_MSG),
            body("language")
                .exists()
                .if(body("language").isIn([ko, en]))
                .withMessage(signUp.LANGUAGE_ERROR_MSG),
        ]
        return (req, res, next) => {
            const {errors} = validationResult(req)
            if (errors.length !== 0) {
                return res.status(400).json({
                    response: signUp.RESPONSE_FAIL,
                    msg: signUp.RESPONSE_ERROR,
                    errors: errors,
                })
            }
            // 토큰이 헤더에 담겨있는 지 확인
            let token = req.headers.token
            if (!token) {
                res.status(401)
                return res.json({code: "400_7"})
            }

            next()
        return [...validChain]
        }
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
            let encryptionToken = req.encryptionToken
            let authUniqueToken = db.schema.authToken.token

            if (encryptionToken !== authUniqueToken){
                res.status(401)
                return res.json({code: "401_2"})
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
            let body = req.body
            let encryptedPassword = req.encryptionPassword
            let user = db.schema.user
            let optionalTerms = db.schema.optionalTerms

            // 회원가입 정보 저장
            // 원래 하고 싶었던건.. db에 저장된 authToken 안에 있는 값들을 가지고 와서 user에 추가하고 싶었는데..
            user[encryptedPassword] = {
                id: body.id,
                password: encryptedPassword,
                name: body.name,
                email: body.email,
                phone: body.phone,
                country: body.country,
                language: body.language,
            }

            // 선택약관 캐싱 저장
            optionalTerms[encryptedPassword] = {
                id: body.id,
                password: encryptedPassword,
                name: body.name,
            }
            next()
        }
    },

    responder: () => {
        return () => {
            console.log("회원가입이 완료되었습니다.")
        }
    }
}