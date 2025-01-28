const { BlogDatabaseClient } = require("./out/db/client/BlogDatabaseClient");
const rest = require("./in/rest");
const mongoose = require("mongoose");
const db = require("./out/db/db");
const express = require("express");

async function main() {
  const connection = db.init(mongoose);
  const dbClient = BlogDatabaseClient(connection);
  const app = express();

  rest.configure(app, dbClient);
  rest.start(app);
}

main();
