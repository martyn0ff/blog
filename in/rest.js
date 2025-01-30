const cors = require("cors");
const express = require("express");
const config = require("../config");
const { logger } = require("../config");
const { blogsRouter } = require("./route/blogs");
const { usersRouter } = require("./route/users");
const { loginRouter } = require("./route/login");
const { unknownEndpoint } = require("./middleware/unknownEndpoint");
const { errorHandler } = require("./middleware/errorHandler");

function configure(app, dbClientRegistry) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/blogs", blogsRouter(dbClientRegistry.blogDatabaseClient));
  app.use("/api/users", usersRouter(dbClientRegistry.userDatabaseClient));
  app.use("/api/login", loginRouter(dbClientRegistry.userDatabaseClient));
  app.use(errorHandler());
  app.use(unknownEndpoint());
  return app;
}

function start(app) {
  app.listen(config.APPLICATION_PORT, config.APPLICATION_HOST, () => {
    logger.info(
      `Server running on host ${config.APPLICATION_HOST}, port ${config.APPLICATION_PORT}`,
    );
  });
}

module.exports = { configure, start };
