const utils = require('../../../utils')
const std = require('../../../standards')

module.exports = {
    /*
     * id
     * password
     * gender
     */
    validation: () => {
        return (req, res, next) => {
            let body = req.body
            const userStd = std.user

            if (body.id === undefined || body.password === undefined || body.token === undefined) {
                return res.status(400).json({code: '400_2'})
            }

            let regExp = new RegExp("^[a-zA-Z0-9]{" + userStd.idMinLength + "," + userStd.idMaxLength + "}$")
            if (regExp.test(body.id) === false) {
                return res.status(400).json({code: '400_8'})
            }

            //최소 8 자
            regExp = new RegExp("^[a-zA-Z0-9]{" + userStd.passwordMinLength + "," + userStd.passwordMaxLength + "}$")
            if (regExp.test(body.password) === false) {
                return res.status(400).json({code: '400_9'})
            }

            if (body.gender !== userStd.genderMan && body.gender !== userStd.genderWoman) {
                return res.status(400).json({code: '400_10'})
            }

            regExp = new RegExp("^[a-zA-Z0-9]{" + std.authNum.tokenLength + ",}$")
            if (regExp.test(body.token) === false) {
                return res.status(400).json({code: '400_7'})
            }

            if (body.optionalTerms !== undefined) {
                try {
                    body.optionalTerms = JSON.parse(body.optionalTerms)
                } catch (error) {
                    return res.status(400).json({code: "400_11"})
                }

                if (!(body.optionalTerms instanceof Array)) {
                    return res.status(400).json({code: "400_11"})
                }
            }

            next()
        }
    },

    duplicatedKeyChecker: (db) => {
        return (req, res, next) => {
            const body = req.body
            let user = db.schema.user

            for (let pk in user) {
                let searchedUser = user[pk]
                if (searchedUser.id === body.id) {
                    return res.status(409).json({code: "409_1"})
                }
            }

            next()
        }
    },

    encryptionToken: () => {
        return (req, res, next) => {
            const body = req.body
            req.encryptedToken = utils.encryption(body.token)

            next()
        }
    },

    validationToken: (db) => {
        return (req, res, next) => {
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

    encryptionPassword: () => {
        return (req, res, next) => {
            const body = req.body
            req.encryptedPassword = utils.encryption(body.password)

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

