class Logger {
  disabledLevels = new Set();
  levels = ["TRACE", "INFO", "WARN", "ERROR", "FATAL"];
  name;
  #maxLevelLength = this.#calculateMaxLevelLength();

  static logger(name) {
    return new Logger(name);
  }

  constructor(name) {
    this.name = name;
    Object.freeze(this);
  }

  disableLevel(level) {
    return this.disabledLevels.add(level);
  }

  disableAllLevels() {
    this.levels.forEach((level) => this.disableLevel(level));
    return true;
  }

  enableLevel(level) {
    return this.disabledLevels.delete(level);
  }

  enableAllLevels() {
    this.levels.forEach((level) => this.enableLevel(level));
  }

  trace(message, ...params) {
    this.#printLog(message, "TRACE", ...params);
  }

  info(message, ...params) {
    this.#printLog(message, "INFO", ...params);
  }

  warn(message, ...params) {
    this.#printError(message, "WARN", ...params);
  }

  error(message, ...params) {
    this.#printError(message, "ERROR", ...params);
  }

  fatal(message, ...params) {
    this.#printError(message, "FATAL", ...params);
  }

  #calculateMaxLevelLength() {
    const reducer = (maxLen, currLevel) =>
      currLevel.length > maxLen ? currLevel.length : maxLen;
    return this.levels.reduce(reducer, 0);
  }

  #printLog(message, level, ...params) {
    if (this.disabledLevels.has(level)) {
      return;
    }

    const name = this.name ? `${this.name}` : "";
    const formattedLevel = level.padEnd(this.#maxLevelLength, " ");
    const date = this.#formatDate(new Date());
    if (params.length === 0) {
      console.log(`${date} | ${name} | ${formattedLevel} | ${message}`);
    } else {
      console.log(
        `${date} | ${name} | ${formattedLevel} | ${message}`,
        ...params,
      );
    }
  }

  #printError(message, level, ...params) {
    if (this.disabledLevels.has(level)) {
      return;
    }

    const name = this.name ? `${this.name}` : "";
    const formattedLevel = level.padEnd(this.#maxLevelLength, " ");
    const date = this.#formatDate(new Date());
    if (params.length === 0) {
      console.error(`${date} | ${name} | ${formattedLevel} | ${message}`);
    } else {
      console.error(
        `${date} | ${name} | ${formattedLevel} | ${message}`,
        ...params,
      );
    }
  }

  #formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

module.exports = Logger;
