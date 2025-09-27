// middleware/context.js
const models = require("../models");

module.exports = (req, res, next) => {
  req.context = {
    models,
  };
  next();
};
