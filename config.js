const rootPath = "/home/roman/WebstormProjects/blog";
require("dotenv").config({
  path: `${rootPath}/.env.${process.env.NODE_ENV}`,
});
const logger = require("./util/Logger").logger("app logger");

const MONGODB_URI = process.env.MONGODB_URI;
const APPLICATION_HOST = process.env.APPLICATION_HOST || "localhost";
const APPLICATION_PORT = process.env.APPLICATION_PORT || "3000";
const BCRYPT_ROUNDS = 10;

validate();

function validate() {
  if (!MONGODB_URI) {
    throw new Error("MongoDB URI is missing");
  }
}

module.exports = {
  MONGODB_URI,
  APPLICATION_HOST,
  APPLICATION_PORT,
  BCRYPT_ROUNDS,
  logger,
};
