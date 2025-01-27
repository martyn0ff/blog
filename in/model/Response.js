class Response {
  status;
  message;
  details;

  constructor(status, message, details) {
    this.status = status;
    this.message = message;
    this.details = details;
    Object.freeze(this);
  }
}