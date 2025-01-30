const config = require("../../config");
const { logger } = require("../../config");

/**
 * Base `toJSON()` function that removes `_id` and `__v` keys from
 * the representation of a document. Any further transformations
 * can be passed through `transform` argument.
 * @param transform transform function to transform the document further
 * @returns {{transform: *}}
 */
function toJSON(transform) {
  return {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;

      if (transform) {
        transform(document, returnedObject);
      }
    },
  };
}

function configure(mongoose) {
  mongoose.set("strictQuery", false);
  return mongoose;
}

async function connect(mongoose) {
  const connection = {};
  try {
    logger.info("Connecting to DB.");
    connection.connection = await mongoose.connect(config.MONGODB_URI);
  } catch (err) {
    logger.error(err);
    throw err;
  }

  logger.info("Connected to DB");
  return connection.connection;
}

async function init(mongoose) {
  return connect(configure(mongoose));
}

async function close(mongoose) {
  return mongoose.connection.close();
}

module.exports = { toJSON, init, close };
