class Response {
  status;
  message;
  details;

  static success(message) {
    return new Response("success", message);
  }

  static error(message, details) {
    return new Response("error", message, details);
  }

  constructor(status, message, details) {
    this.status = status;
    this.message = message;
    this.details = details || {};
    Object.freeze(this);
  }
}

module.exports = { Response };
