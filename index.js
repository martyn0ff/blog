const {
  DatabaseClientRegistry,
} = require("./out/db/client/DatabaseClientRegistry");
const rest = require("./in/rest");
const mongoose = require("mongoose");
const db = require("./out/db/db");
const express = require("express");

async function main() {
  const connection = db.init(mongoose);
  const dbClientRegistry = DatabaseClientRegistry(connection);
  const app = express();

  rest.configure(app, dbClientRegistry);
  rest.start(app);
}

main();
