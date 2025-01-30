const { Response } = require("../../in/model/Response");
const { logger } = require("../../config");

function errorHandler() {
  return (error, req, res, next) => {
    logger.error(`Error handler middleware has caught an error ${error.name}`);

    if (res.headersSent) {
      logger.error(
        "Headers were already sent, error handler does not do anything.",
      );
      return next(error);
    }

    if (error.name === "ValidationError") {
      // TODO: Anything we want to do with validation errors?
    }

    if (error.name === "MongoServerError") {
      // TODO: Show better error message when
      //  unique constraint is violated
    }

    logger.error("Finished error handling.");
    return res
      .status(400)
      .json(Response.error(error.message, { name: error.name }));
  };
}

module.exports = { errorHandler };
