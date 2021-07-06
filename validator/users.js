const { body, header, validationResult } = require('express-validator')

module.exports = {
    check: [
        body('account')
            .exists() // check if undefined
            // ! 질문 code를 좀 더 구체화하고자 400_2대신 400_10을 새롭게 만들었는데 code가 너무 많아지는 건가요?
            .withMessage('code: 400_10')
            // .bail() // Stops running validations if any of the previous ones have failed.
            .isString()
            .withMessage('code: 400_11')
            .isLength({ min: 6, max: 12 })
            .withMessage('code: 400_12'),
        body('password')
            .exists()
            .withMessage('code: 400_13')
            .matches(
                /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+])(?!.*[^a-zA-z0-9$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/,
            ) // client와 동일한 정규식을 사용하기 위해 matches를 사용
            .withMessage('code: 400_14'),
        header('authorization')
            // ! 질문 exists가 정말 필요한가?
            .exists()
            .withMessage('code: 400_15')
            .isJWT()
            .withMessage('code: 400_16'),
    ],
    validationResult: (req, res, next) => {
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            errors = errors.array()
            for (let i = 0; i < errors.length; i++) {
                if (errors[i].param === 'password') {
                    errors[i].value = 'unshown for clients' // clients 측 에러메시지의 비밀번호를 가리기 위함.
                }
            }
            return res.status(400).json({ errors })
        }

        next()
    },
}
