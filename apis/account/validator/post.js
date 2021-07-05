const { body, validationResult } = require('express-validator')

module.exports = {
    validation: () => {
        return body('email').isEmail()
    },

    responder: () => {
        return (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            res.json({ code: 200 })
        }
    },
}
