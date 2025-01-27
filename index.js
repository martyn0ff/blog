const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, `./.env.${process.env.NODE_ENV}`),
});
const express = require("express");
const { BlogDatabaseClient } = require("./out/db/client/BlogDatabaseClient");
const rest = require("./in/rest");
const mongoose = require("mongoose");

async function main() {
  const dbClient = BlogDatabaseClient(mongoose);
  const app = express();

  rest.configure(app, dbClient);
  rest.start(app);
}

main();
