const crypto = require('crypto')

function encryption(str) {
    return crypto.createHash('sha512').update(str).digest('base64')
    // return crypto.createHash('sha512').update(str).digest('base64')
}

console.log(encryption('hello'))
