module.exports = {
    "plugins":[
        "prettier"
    ],
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:prettier/recommended"
    ],

    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "script",
        "ecmaFeatures": {
            "jsx": false
        }
    },
    "rules": {
        'no-console':"off",
        "no-unused-vars": "warn",
        "prettier/prettier": "error"
    }
};
