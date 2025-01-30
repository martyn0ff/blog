class ConfigurationError extends Error {
  name;

  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
    Error.captureStackTrace(this, this.constructor);
    Object.freeze(this);
  }
}

module.exports = { ConfigurationError };
