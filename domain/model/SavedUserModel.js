class SavedUserModel {
  username;
  passwordHash;
  name;

  constructor(username, passwordHash, name) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.name = name;
    Object.freeze(this);
  }
}

module.exports = { SavedUserModel };