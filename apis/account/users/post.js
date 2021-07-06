const { verify } = require('jsonwebtoken')

// todo express-validator로 refactor
const utils = require('../../../utils')
const { check, validationResult } = require('../../../validator/users')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return [...check, validationResult]
    },

    // ! 정규식을 이용한 validation
    // validation: () => {
    //     return (req, res, next) => {
    //         const { account, password } = req.body
    //         const authorization = req.headers.authorization
    //
    //         if (
    //             account === undefined ||
    //             password === undefined ||
    //             authorization === undefined
    //         ) {
    //             return res.status(400).json({ code: '400_1' })
    //         }
    //
    //         const regExpAccount = /^[0-9a-z]{6,12}$/
    //         if (!regExpAccount.test(account) || typeof account !== 'string') {
    //             return res.status(400).json({ code: '400_7' })
    //         }
    //
    //         const regExpPassword =
    //             /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+])(?!.*[^a-zA-z0-9$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
    //         if (!regExpPassword.test(password)) {
    //             return res.status(400).json({ code: '400_8' })
    //         }
    //
    //         next()
    //     }
    // },

    tokenVerifier: () => {
        return (req, res, next) => {
            const authorization = req.headers.authorization

            try {
                // req.authPk는 토큰이 탈취된 상황에서 발생할 수 있는 문제를 방지하는 데 사용된다.
                // cf> JWT에 key값(email 또는 phone)을 넣지 않았던 까닭은, JWT이 탈취되었다는 가정이라면 이미 JWT를 까볼 수 있기 때문이다.
                // 따라서 authPk만 넣어두고 서버에서 DB를 조회하는 형식으로 코드를 작성했다.
                req.authPk = verify(
                    authorization,
                    process.env.SECRET_KEY,
                ).authPk

                next()
            } catch (err) {
                return res.status(400).json({ code: '400_9', err })
            }
        }
    },

    passwordEncryption: () => {
        return (req, res, next) => {
            // salt에 account VS column 만들기
            const { password } = req.body
            const encryption = utils.encryption

            req.salt = encryption(Date.now().toString())
            req.password = encryption(password + encryption(req.salt))

            next()
        }
    },

    // ! 나눠야 할까?
    syncDBUserAuthToken: (db) => {
        return (req, res, next) => {
            const user = db.schema.user
            const auth = db.schema.auth
            const authToken = db.schema.authToken
            const pk = db.pk
            const authorization = req.headers.authorization
            const { account, email, phone } = req.body
            const { password, salt, authPk } = req
            let bAuthorizationUsed = false

            for (let authTokenPk in authToken) {
                if (authToken[authTokenPk].authorization === authorization) {
                    bAuthorizationUsed = true
                    break
                }
            }

            // (1) 회원가입 후 회원가입에 사용한 authorization(토큰)은 db.schema.authToken에 저장하여 같은 authToken으로 중복가입하는 것을 막는다.
            if (bAuthorizationUsed) {
                return res.status(401).json({ code: '401_2' })
            }

            // (2) authToken을 발급받은 자가 authToken 발급 시 기입한 email 또는 phone으로 가입하는 지를 확인하여 token이 탈취되었을 가능성에 대비한다.
            // ! 질문: db를 한번 더 조회해야한다는 비효율에 대해
            // cf> authToken의 탈취 가능성에 대비하여 authToken의 expire 시간을 줄이는 방안도 생각해볼 수 있다.
            if (
                auth[authPk].type === authNumStd.authNumTypeEmail &&
                auth[authPk].key !== email
            ) {
                return res.status(401).json({ code: '401_3' })
            } else if (
                auth[authPk].type === authNumStd.authNumTypePhone &&
                auth[authPk].key !== phone
            ) {
                return res.status(401).json({ code: '401_4' })
            }

            // account 중복 확인
            for (let userPk in user) {
                if (user[userPk].account === account) {
                    // ! (질문)예를 들어 아래와 같은 status code를 정하는 데 어느 정도의 시간을 투자하는 게 맞을까?
                    return res.status(409).json({ code: '409_1' })
                }
            }

            // cf> 가입 도중 서버가 터졌다면?(transaction)
            // user table에만 data가 저장된 상태에서, 다음 단계의 optionalTerms에는 data가 저장되지 못한 채 서버가 터졌다고 가정해보자.
            // 이와 같은 상황에서 해당 유저가 다시 한번 회원가입 절차를 밟는다고 가정했을 때, 이전에 기입한 account는 사용할 수 없게 된다.
            // 이미 db에 해당 account가 저장되었기 때문이다.
            // 이와 같은 상황을 방지하려면 (1)현재의 코드상황에서 어떻게 하면 좋을 지, (2)실제 상황에서는 transaction을 어떻게 구현할 것인지 생각해보자.

            user[pk.userPk] = {
                account,
                password,
                email,
                phone,
                salt,
                createdAt: Date.now(),
            }

            req.userPk = pk.userPk
            pk.userPk++

            authToken[pk.authTokenPk] = {
                authorization,
                createdAt: Date.now(),
            }

            pk.authTokenPk++

            // ! check
            // console.log('user: ', user)
            // console.log('auth: ', auth)
            // console.log('authToken: ', authToken)

            next()
        }
    },

    syncDBOptionalTerms: (db) => {
        return (req, res, next) => {
            const { BTerms1, BTerms2, BTerms3 } = req.body
            // todo spread syntax/rest parameter 활용해서 좀 더 일반적인 코드로 변경 가능할까?

            const optionalTerms = db.schema.optionalTerms
            const pk = db.pk

            optionalTerms[pk.optionalTermsPk] = {
                userPk: req.userPk, // foreign key
                BTerms1,
                BTerms2,
                BTerms3,
            }

            pk.optionalTermsPk++

            // ! check
            // console.log("optionalTerms: ", optionalTerms)
            // console.log("pk: ", pk)

            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.status(201).json({ code: '201_1' })
        }
    },
}
