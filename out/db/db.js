const config = require("../../util/config");
const logger = require("../../util/logger");

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
  return await configure(mongoose)
    .connect(config.MONGODB_URI)
    .then((m) => {
      logger.info("Connected to database successfully");
      return m;
    })
    .catch((err) => {
      logger.error(err);
      throw err;
    });
}

module.exports = { toJSON };
