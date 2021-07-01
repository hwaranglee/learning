const { body, validationResult } = require("express-validator");

const { authNum } = require("../../standards");
const { strings } = require("../../constants");
const { authNumTypePhone, authNumTypeEmail, length } = authNum;

module.exports = {
  authNumValidator: [
    body("type")
      .exists()
      .isIn([authNumTypeEmail, authNumTypePhone])
      .withMessage(strings.TYPE_ERROR),
    body("phoneNo")
      .if(body("type").isIn([authNumTypePhone]))
      .isMobilePhone("any")
      .isLength({ min: 11, max: 11 })
      .withMessage(strings.PHONE_NO_ERROR_MSG),
    body("email")
      .if(body("type").isIn([authNumTypeEmail]))
      .isEmail()
      .withMessage(strings.EMAIL_ERROR_MSG),
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
