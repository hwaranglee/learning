const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { authNum } = require('./standards')
const { authNumTypePhone: phoneType, authNumTypeEmail: emailType, } = authNum

module.exports = {
  createRandomString: (length) => {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength))
    }
    return result
  },
  encryption: (str) => {
    return crypto.createHash('sha512').update(str).digest('base64')
  },
  getValueByType: (body) => {
    const { type } = body
    const email = body?.email
    const phone = body?.phone

    if (type === phoneType) {
      return `${phone}`
    } else if (type === emailType) {
      return `${email}`
    }
  },
  generateToken: (_id) => {
    // const token = jwt.sign(_id.toHexString(), 'secretToken');
    const token = jwt.sign({ data: _id }, 'secret', { expiresIn: 60 * 60 }) // 1h
    return token
  }
}
