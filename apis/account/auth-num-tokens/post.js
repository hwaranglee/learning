const utils = require("../../../utils");
const std = require("../../../standards");

module.exports = {
  validation: () => {
    return (req, res, next) => {
      next();
    };
  },

  encryption: () => {
    return (req, res, next) => {
      next();
    };
  },

  validationAutNum: (db) => {
    return (req, res, next) => {
      next();
    };
  },

  tokenGenerator: () => {
    return (req, res, next) => {
      next();
    };
  },

  syncDB: (db) => {
    return (req, res, next) => {
      next();
    };
  },

  responder: () => {
    return (req, res) => {
      res.json({
        token: req.token,
      });
    };
  },
};
