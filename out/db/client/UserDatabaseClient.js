const { UserDocument } = require("../model/UserDocument");

function UserDatabaseClient(mongoose) {
  const User = UserDocument(mongoose);

  async function save(user) {
    const document = new User(user);
    return document.save();
  }

  async function findOne(criteria) {
    return User.findOne(criteria);
  }

  async function getAll() {
    return User.find({});
  }

  return {
    User,
    save,
    getAll,
    findOne,
  };
}

module.exports = { UserDatabaseClient };
