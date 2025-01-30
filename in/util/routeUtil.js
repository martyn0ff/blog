const { logger } = require("../../config");

/**
 * A wrapper for express handler that would catch any uncaught errors inside
 * an async handler and would pass the error down to the middleware.
 * @param handler
 * @returns {(function(*, *, *): Promise<void>)|*}
 */
function safeAsyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      logger.error(
        `Caught the uncaught error: ${error.name}. It will be passed down to any available middleware.`,
      );
      next(error);
    }
  };
}

module.exports = { safeAsyncHandler };
