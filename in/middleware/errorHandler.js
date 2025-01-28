const { Response } = require("../../in/model/Response");
const { logger } = require("../../util/config");

function errorHandler() {
  return (error, req, res, next) => {
    logger.error("Error handler middleware has caught an error");

    if (res.headersSent) {
      return next(error);
    }

    return res
      .status(400)
      .json(Response.error(error.message, { name: error.name }));
  };
}

module.exports = { errorHandler };
