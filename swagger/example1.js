const commonSb = require('../../../../../../../common/presentation/spec-builder')
const spec = {
    '/{version}/labor-service-orders/{laborServiceOrderNo}/undo/assignment': {
        parameters: [
            {
                in: 'path',
                name: 'laborServiceOrderNo',
                required: true,
                description: '용역 서비스 주문번호',
                schema: {
                    $ref: '#/components/schemas/SerialNumber',
                },
            },
            {
                in: 'query',
                name: 'accountKey',
                required: false,
                description: '구매자 키',
                schema: {
                    $ref: '#/components/schemas/AccountKey',
                },
            },
        ],
        put: {
            tags: ['labor-service-order'],
            operationId: 'undoAssignment',
            summary: '전문가 배정 취소',
            description: '전문가 배정을 취소합니다.',
            requestBody: {
                description: '전문가 배정을 취소하기 위한 객체',
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: {},
                            example: {},
                            properties: {
                                assignmentCancelReason:
                                    commonSb.string('배정 취소 사유'),
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            responses: commonSb.buildDomainObjectResponse(
                '200',
                '전문가 배정 취소 성공',
                'LaborServiceOrder',
            ),
        },
    },
}

module.exports = spec
