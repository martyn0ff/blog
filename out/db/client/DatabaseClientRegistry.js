const { BlogDatabaseClient } = require("./BlogDatabaseClient");
const { UserDatabaseClient } = require("./UserDatabaseClient");

// Clients share connection for now
function DatabaseClientRegistry(connection) {
  const blogDatabaseClient = BlogDatabaseClient(connection);
  const userDatabaseClient = UserDatabaseClient(connection);

  return {
    blogDatabaseClient,
    userDatabaseClient,
  };
}

module.exports = { DatabaseClientRegistry };
