function LoginRequest(username, password) {
  return Object.freeze({
    username,
    password,
  });
}

module.exports = { LoginRequest };
