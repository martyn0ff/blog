const config = require("../../util/config");
const { logger } = require("../../util/config");

function toJSON() {
  return {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
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
