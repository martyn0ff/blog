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

validate();

function validate() {
  if (!MONGODB_URI) {
    throw new ConfigurationError("MongoDB URI is missing");
  }
  if (!SECRET) {
    throw new ConfigurationError("Missing secret");
  }
}

module.exports = {
  MONGODB_URI,
  APPLICATION_HOST,
  APPLICATION_PORT,
  BCRYPT_ROUNDS,
  SECRET,
  logger,
};
