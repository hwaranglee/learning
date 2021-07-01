const { authNum } = require("../../standards");

const { authNumTypePhone, authNumTypeEmail } = authNum;

module.exports = {
  getKeyByType(type, body) {
    if (type === authNumTypeEmail) {
      return body.email;
    }
    if (type === authNumTypePhone) {
      return body.phoneNo;
    }
  },
};
