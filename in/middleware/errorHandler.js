const { Response } = require("../../in/model/Response");
const { logger } = require("../../config");
const { ValidationError } = require("../../common/error/ValidationError");
const { MongoServerError } = require("mongoose").mongo;
const { MongooseError, CastError } = require("mongoose");
const { JsonWebTokenError } = require("jsonwebtoken");

function errorHandler() {
  return (error, req, res, next) => {
    logger.error(`Error handler middleware has caught an error ${error.name}`);
    logger.error("", error);

    if (res.headersSent) {
      logger.error(
        "Headers were already sent, error handler does not do anything.",
      );
      return next(error);
    }

    const badRequestResponse = res.status(400);

    // TODO: Later when we have to think of APIs, we may want
    //  to send prettier and more informative responses.
    if (error instanceof ValidationError) {
      return badRequestResponse.json(Response.error(error.message));
    }

    if (error instanceof MongoServerError) {
      // TODO: Show better error message when
      //  unique constraint is violated
    }

    if (error instanceof MongooseError) {
      if (error instanceof CastError) {
        // This usually happens when the user is passing ID that
        // does not comply with that of Mongo's standard ObjectId
        if (error.message.includes("Cast to ObjectId failed")) {
          return res.status(404).send(Response.error("Not found"));
        }
      }
    }

    if (error instanceof JsonWebTokenError) {
      // TODO: Anything special?
    }
    return badRequestResponse.end();
  };
}

module.exports = { errorHandler };
