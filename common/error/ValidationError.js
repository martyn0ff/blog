class ValidationError extends Error {
  name;

  constructor(message) {
    super(message);
    this.name = "ValidationError";
    Error.captureStackTrace(this, this.constructor);
    Object.freeze(this);
  }
}

module.exports = { ValidationError };
