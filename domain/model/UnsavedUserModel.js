class UnsavedUserModel {
  username;
  password;
  name;

  constructor(username, password, name) {
    this.username = username;
    this.password = password;
    this.name = name;
    Object.freeze(this);
  }
}

module.exports = { UnsavedUserModel };
