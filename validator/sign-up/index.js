const { body, validationResult } = require("express-validator");

const { strings } = require("../../constants");

module.exports = {
  signUpValidator: [
    body("id").exists({ checkFalsy: true }),
    body("password").exists({ checkFalsy: true }).isLength({ min: 8, max: 20 }),
    body("name").exists({ checkFalsy: true }),
    body("agreeTerms").exists({ checkFalsy: true }),
    body("token").exists({ checkFalsy: true }),
  ],
  validationErrorHandler: (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length !== 0) {
      return res.status(400).json({
        response: strings.RESPONSE_ERROR,
        msg: strings.VALIDATE_ERROR,
        errors: errors,
      });
    }

    next();
  },
};
