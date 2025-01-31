const rootPath = "/home/roman/WebstormProjects/blog";
require("dotenv").config({
  path: `${rootPath}/.env.${process.env.NODE_ENV}`,
});
const logger = require("./util/Logger").logger("app logger");
const { ConfigurationError } = require("./common/error/ConfigurationError");

const MONGODB_URI = process.env.MONGODB_URI;
const APPLICATION_HOST = process.env.APPLICATION_HOST || "localhost";
const APPLICATION_PORT = process.env.APPLICATION_PORT || "3000";
const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || 12;
const SECRET = process.env.SECRET;
const MAGIC_NUMBER = process.env.MAGIC_NUMBER;

validate();

function validate() {
  if (!MONGODB_URI) {
    throw new ConfigurationError("Missing MongoDB URI");
  }
  if (!SECRET) {
    throw new ConfigurationError("Missing secret");
  }
  if (process.env.NODE_ENV === "test" && !MAGIC_NUMBER) {
    throw new ConfigurationError(
      "Set up MAGIC_NUMBER environment variable for blog tests to ignore requirement for a token. THIS IS A TEMPORARY MEASURE, DO NOT USE THIS IN REAL PROJECTS.",
    );
  }
}

module.exports = {
  MONGODB_URI,
  APPLICATION_HOST,
  APPLICATION_PORT,
  BCRYPT_ROUNDS,
  SECRET,
  MAGIC_NUMBER,
  logger,
};
