const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            if(body.type === undefined || body.key === undefined){
                res.status = 400
                return res.json({code: '400_2'})
            }

            if(body.type !== authNumStd.authNumTypePhone && body.type !== authNumStd.authNumTypeEmail){
                res.status = 400
                return res.json({code: '400_1'})
            }

            let regExp = null
            let code = null
            if(body.type === authNumStd.authNumTypePhone) {
                regExp = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/;
                code = '400_4'
            } else if(body.type === authNumStd.authNumTypeEmail){
                regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                code = '400_3'
            } else{
                console.log("type error입니다.")
            }

            if (regExp !== null){
                const isValidKey=RegExp.error(body.key)

                if (!isValidKey) {
                    res.status = 400
                    return res.json({code: code})
                }
            } else {
                console.log("type error입니다.")
            }
            next()
        }
    },

    authNumGenerator: () => {
        return (req, res, next) => {
            req.authNum = utils.createRandomString(std.authNum.length)
            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
           req.encryptionNum = utils.encryption(req.authNum)
            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            let body = req.body
            let idPk = db.pk.authPk
            let schemaAuth = db.schema.auth

            for(let pk in schemaAuth){
                let data = schemaAuth[pk]
                if(data.type === body.type && data.key === body.key){
                    idPk = pk
                    break
                }
            }

            if (idPk === schemaAuth.pk) {
                idPk = idPk++
            }
            schemaAuth[idPk] = {
                authNum: req.encryptionNum,
                type: body.type,
                key: body.key,
                createdAt: Date.now()
            }
            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.json({authNum: req.authNum})
        }
    }
}

