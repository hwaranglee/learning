const { verify } = require('jsonwebtoken')
// todo express-validator로 refactor
// const { body, validationResult } = require('express-validator')

const utils = require('../../../utils')

module.exports = {
    validation: () => {
        return (req, res, next) => {
            const { account, password } = req.body
            const authorization = req.headers.authorization

            if (
                account === undefined ||
                password === undefined ||
                authorization === undefined
            ) {
                return res.status(400).json({ code: '400_1' })
            }

            const regExpAccount = /^[0-9a-z]{6,12}$/
            if (!regExpAccount.test(account) || typeof account !== 'string') {
                return res.status(400).json({ code: '400_7' })
            }

            const regExpPassword =
                /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+])(?!.*[^a-zA-z0-9$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
            if (!regExpPassword.test(password)) {
                return res.status(400).json({ code: '400_8' })
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
                return res.status(400).json({ code: '400_9' })
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

    syncDBUser: (db) => {
        return (req, res, next) => {
            const { account } = req.body
            const { password, salt } = req
            const user = db.schema.user
            const pk = db.pk

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
                salt,
                createdAt: Date.now(),
            }

            req.userPk = pk.userPk
            pk.userPk++

            // ! check
            console.log('user: ', user)

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
        return (req, res, next) => {
            res.status(201).json({ code: '201_1' })
        }
    },
}
