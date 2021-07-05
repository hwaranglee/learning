let db = {
    pk: {
        authPk: 0,
        userPk: 0,
        loginHistoryPk: 0,
        termsPk: 0,
        optionalTermsPk: 0,
        versionPk: 0,
        extinctUserPk: 0,
        authTokenPk: 0
    },
    schema: {
        authToken: {},
        auth: {},
        user: {},
        loginHistory: {},
        terms: {},
        optionalTerms: {},
        version: {},
        extinctUser: {}
    }
}

module.exports = db
