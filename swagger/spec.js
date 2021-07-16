const codes = require('../codes.json')
// ! 쓱싹서버에서 키워드 rows, count를 반드시 찾아보도록
// ! 질문 대소문자 관련: url도 하이픈으로 쓴다.
// ! url은 너무 길면 안좋음. limit이 있거든. (query 할 때 배열 때려넣지 말라는 거야.)
// ! 좋은 키워드 하나: snippet code
// ! class

module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'Swagger Practice',
        description: '로켓스터디와 함께 즐거운 Swagger 학습!',
        version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
        {
            name: 'account',
            description: 'http://localhost:3000/account',
        },
        {
            name: 'example',
            description: 'http://localhost:3000/example',
        },
    ],
    paths: {
        '/account/auth-nums': {
            post: {
                tags: ['account'],
                summary: '회원가입을 위한 인증번호 받기.',
                description:
                    '회원가입을 위한 인증번호를 서버에서 생성하고, 클라이언트는 이를 받습니다.',
                // ! check operationId 관련 규칙이 있을까요?
                operationId: 'accountAuthNumsPost',
                requestBody: {
                    description: '인증번호를 받기 위한 객체.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['type', 'key'],
                                properties: {
                                    type: {
                                        type: 'string',
                                        enums: ['email', 'phone'],
                                    },
                                    key: {
                                        type: 'string', // 정규식을 or로 연결하던가, 최소한 lenth check라도
                                        // ! check length check 언제나 해야한다.
                                        // ! check example은 어떻게 주는 게 좋을까? phone, email의 예시가 각각 다를테니...
                                        // example: '010-1111-1111',
                                    },
                                },
                                // ! check validation의 기능이 없다면 아래와 같은 속성은 도대체 왜 존재하는 걸까?
                                // minProperties: 2,
                                // maxProperties: 10,
                                // ! check additionalProperties에 대한 왜 특별한 언급이 안뜨지?
                                additionalProperties: false,
                                example: {
                                    type: 'phone',
                                    key: '010-1111-1111',
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    201: {
                        description: codes['201_2'],
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['code', 'authNum'],
                                    properties: {
                                        // ! check validation 추가해야 한다. length는 언제나 중요. length 가져올 때는 std require.
                                        // ! 정규식 같은 거 추가할 때도 require 하기. 하늘색(상수값)을 코드에서 볼 수 없게 하라. 방어적으로 코드해야함. 상수하나 때문에 가입 못하는 불상사가 생길 수 있다.
                                        code: { type: 'string' },
                                        authNum: { type: 'string' },
                                    },
                                    example: {
                                        // ! 통일된 form으로
                                        code: '201_2',
                                        authNum: 'LA8x1B',
                                    },
                                },
                            },
                        },
                    },
                    // ! 다른 response도 다 복붙
                    400: { $ref: '#/components/responses/BadRequest' },
                },
            },
        },
        '/account/auth-num-tokens': {
            post: {
                tags: ['account'],
                summary: '회원가입 인증번호를 입력하고 토큰 받기.',
                description:
                    '회원가입을 위해 받은 인증번호를 클라이언트에서 입력하고, 서버에서 인증번호를 확인하여 회원가입에 필요한 토큰을 클라이언트에게 전달합니다.',
                operationId: 'accountAuthNumTokensPost',
                requestBody: {
                    description: '인증번호 정보를 가진 객체.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['type', 'key', 'authNum'],
                                properties: {
                                    type: {
                                        type: 'string',
                                        enums: ['email', 'phone'],
                                    },
                                    key: {
                                        type: 'string',
                                    },
                                    authNum: {
                                        type: 'string',
                                    },
                                },
                                additionalProperties: false,
                                example: {
                                    type: 'phone',
                                    key: '010-1111-1111',
                                    authNum: 'LA8x1B',
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    201: {
                        description: codes['201_3'],
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['code', 'token'],
                                    properties: {
                                        code: { type: 'string' },
                                        token: { type: 'string' },
                                    },
                                    example: {
                                        code: '201_3',
                                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoUGsiOiIxIiwiaWF0IjoxNjI2MzMzNTM2LCJleHAiOjE2MjYzMzcxMzZ9.J8gsCWQjXDQqmudKcApI_1fKJOHLaxSBJzwAjYA21CE',
                                    },
                                },
                            },
                        },
                    },
                    // ! keyword or 조건 (분기를 위한 방법)
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    404: { $ref: '#/components/responses/NotFound' },
                },
            },
        },
        '/account/users': {
            post: {
                security: [{ BearerAuth: [] }],
                tags: ['account'],
                summary: '토큰을 활용하여 회원가입.',
                description: '발급받은 토큰을 활용하여 회원가입을 완료합니다.',
                operationId: 'accountUsersPost',
                parameters: [
                    // {
                    //     name: 'testing',
                    //     in: 'header',
                    //     description: 'testing',
                    //     required: true,
                    //     schema: {
                    //         type: 'string',
                    //     },
                    //     example: 'Hi there.',
                    // },
                    {
                        name: 'authorization',
                        in: 'header',
                        description:
                            'Value: Bearer JWT (Swagger UI에서 Try it out을 위해 Authorize할 시에는 Bearer를 제외한 토큰 값만 입렵하면 됩니다.)',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        // ! check Bearer nono. 세션으로 오해할 수도. body에 담아라.(에릭 추천)
                        example:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoUGsiOiIxIiwiaWF0IjoxNjI2MzMzNTM2LCJleHAiOjE2MjYzMzcxMzZ9.J8gsCWQjXDQqmudKcApI_1fKJOHLaxSBJzwAjYA21CE',
                    },
                ],
                requestBody: {
                    description: '회원가입 정보를 가진 객체.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [
                                    'account',
                                    'password',
                                    'email',
                                    'phone',
                                    'BTerms1',
                                    'BTerms2',
                                    'BTerms3',
                                ],
                                properties: {
                                    account: {
                                        // ! check
                                        type: 'string',
                                    },
                                    password: {
                                        // ! check 클라이언트도 알 수 있게.
                                        type: 'string',
                                    },
                                    email: {
                                        type: 'string',
                                    },
                                    phone: {
                                        type: 'string',
                                    },
                                    BTerms1: {
                                        // ! 헝가리언 소문자로
                                        // ! 선택약관은 배열로 받아서 범용적으로.
                                        type: 'boolean',
                                    },
                                    BTerms2: {
                                        type: 'boolean',
                                    },
                                    BTerms3: {
                                        type: 'boolean',
                                    },
                                },
                                additionalProperties: false,
                                example: {
                                    account: 'helloworld',
                                    // ! 키워드 format: 'password'
                                    password: 'asdf123!@#',
                                    email: 'hello@example.com',
                                    phone: '010-1111-1111',
                                    BTerms1: true,
                                    BTerms2: false,
                                    BTerms3: true,
                                },
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    201: {
                        description: codes['201_1'],
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['code'],
                                    properties: {
                                        code: { type: 'string' },
                                    },
                                    example: {
                                        code: '201_1',
                                    },
                                },
                            },
                        },
                    },
                    // ! check express-validator를 쓰다보니 response를 통일하기 위해서는 또 setting을 해야 함.
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    409: { $ref: '#/components/responses/Conflict' },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {},
        responses: {
            // ! check Created 모듈화해줄 수 있을 듯. 시간날 때 해보길.
            Created: {},
            BadRequest: {
                description: codes['400'],
                content: {
                    'application/json': {
                        schema: {
                            // $ref: '#/components/schemas/ClientError',
                            type: 'object',
                            required: ['code'],
                            properties: {
                                code: { type: 'string' },
                                err: { type: 'string' },
                            },
                            example: {
                                code: '400_X',
                            },
                        },
                    },
                },
            },
            Unauthorized: {
                description: codes['401'],
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['code'],
                            properties: {
                                code: { type: 'string' },
                                err: { type: 'string' },
                            },
                            example: {
                                code: '401_X',
                            },
                        },
                    },
                },
            },
            NotFound: {
                description: codes['404'],
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['code'],
                            properties: {
                                code: { type: 'string' },
                                err: { type: 'string' },
                            },
                            example: {
                                code: '404_X',
                            },
                        },
                    },
                },
            },
            Conflict: {
                description: codes['409'],
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['code'],
                            properties: {
                                code: { type: 'string' },
                                err: { type: 'string' },
                            },
                            example: {
                                code: '409_X',
                            },
                        },
                    },
                },
            },
        },
    },
}
