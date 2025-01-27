const JsonResponse = require("../../domain/JsonResponse");
const Logger = require("../../util/Logger");

function errorHandler() {
  return (error, req, res, next) => {
    Logger.trace("(error handler middleware)");
    Logger.error(error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json(JsonResponse.newError(error.name, error.message));
    }

    next(error);
  };
}

module.exports = { errorHandler };
