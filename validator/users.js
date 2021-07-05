const { body, validationResult } = require('express-validator')

module.exports = {
    body: [body('account').isEmail(), body('password').isString()],
    validationResult: [validationResult],
    testing: [
        (req, res, next) => {
            console.log(1)
            next()
        },
        (req, res, next) => {
            console.log(2)
            next()
        },
        (req, res, next) => {
            console.log(3)
            res.json('OK')
        },
        (req, res, next) => {},
    ],
}
