const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY
// todo account, password, createdAt
// todo 선택약관 정보는 따로 저장해야 한다.

const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            const {account, password} = req.body
            const authorization = req.headers.authorization

            if (account === undefined || password === undefined || authorization === undefined) {
                return res.status(400).json({code: "400_1"})
                // todo express-validator로 refactor
            }

            const regExpAccount = /^[0-9a-z]{6,12}$/
            if (!regExpAccount.test(account) || typeof account !== "string") {
                return res.status(400).json({code: "400_7"})
            }

            const regExpPassword = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+])(?!.*[^a-zA-z0-9$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
            if (!regExpPassword.test(password)) {
                return res.status(400).json({code: "400_8"})
            } else {
                return console.log("error")
            }

            next()
        }
    },

    tokenVerifier: () => {
        return (req, res, next) => {
            const authorization = req.headers.authorization

            try {
                verify(authorization, process.env.SECRET_KEY)

                next()
            } catch (err) {
                return res.status(400).json({code: "400_9"})
            }
        }
    },

    passwordEncrption: () => {
        return (req, res, next) => {
            // salt에 account VS column 만들기
            const {password} = req.body
            const encryption = utils.encrytion

            req.salt = encryption(Date.now())
            req.password = encryption(password + encryption(req.salt))

            next()
        }
    },

    syncDBUser: (db) => {
        return (req, res, next) => {
            const {account} = req.body
            const {password, salt} = req
            const user = db.schema.user
            const userPk = db.pk.userPk

            user[userPk] = {
                account,
                password,
                salt,
                createdAt: Date.now()
            }

            req.userPk = userPk
            userPK++

            next()
        }
    },

    syncDBOptionalTerms: (db) => {
        return (req, res, next) => {
            const {BTerms1, BTerms2, BTerms3} = req.body
            // todo spread syntax로 refactor
            const optionalTerms = db.schema.optionalTerms
            const optionalTermsPk = db.pk.optionalTermsPK

            optionalTerms[optionalTermsPk] = {
                optionalTermsPk, // primary key
                userPk: req.userPk, // foreign key
                BTerms1,
                BTerms2,
                BTerms3
            }

            optionalTermsPk++

            next()
        }
    },

    // todo id 존재성 확인
    // todo 가입 도중 인터넷 연결이 끊겼다면?
    responder: () => {
        return (req, res, next) => {
            res.status(201).json({code: "201_1"})
        }
    }
}