function TestUserDatabaseClient(baseUserDatabaseClient) {
  const User = baseUserDatabaseClient.User;

  async function deleteAll() {
    return User.deleteMany({});
  }

  async function saveAll(users) {
    return User.bulkSave(users.map((user) => new User(user)));
  }

  async function countDocuments() {
    return User.countDocuments({});
  }

  async function get(criteria) {
    return User.find(criteria);
  }

  async function getById(id) {
    return User.findById(id);
  }

  async function getAll() {
    return User.find({});
  }

  return {
    ...baseUserDatabaseClient,
    deleteAll,
    saveAll,
    getById,
    getAll,
    get,
    countDocuments,
  };
}

module.exports = { TestUserDatabaseClient };
