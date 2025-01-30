function TestUserDatabaseClient(baseUserDatabaseClient) {
  const User = baseUserDatabaseClient.User;

  async function deleteAll() {
    return User.deleteMany();
  }

  async function saveAll(users) {
    return User.bulkSave(users.map((user) => new User(user)));
  }

  async function getById(id) {
    return User.findById(id);
  }

  return {
    ...baseUserDatabaseClient,
    deleteAll,
    saveAll,
    getById,
  };
}

module.exports = { TestUserDatabaseClient };
