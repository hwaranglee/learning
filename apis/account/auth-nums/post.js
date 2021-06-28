const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            

            next()
        }
    },

    authNumGenerator: () => {
        return (req, res, next) => {
            
            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            
            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            
            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.json({authNum: req.authNum})
        }
    }
}

