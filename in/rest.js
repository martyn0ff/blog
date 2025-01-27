const cors = require("cors");
const express = require("express");
const { blogsRouter } = require("./route/blogs");
const config = require("../util/config");
const unknownEndpoint = require("./middleware/unknownEndpoint");

function configure(app, dbClient) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/blogs", blogsRouter(dbClient));
  app.use(unknownEndpoint());
}

function start(app) {
  app.listen(config.APPLICATION_PORT, config.APPLICATION_HOST, () => {
    console.log(
      `Server running on host ${config.APPLICATION_HOST}, port ${config.APPLICATION_PORT}`,
    );
  });
}

module.exports = { configure, start };
