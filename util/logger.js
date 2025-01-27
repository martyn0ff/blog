function trace(message, ...params) {
  printLog(message, "TRACE", ...params);
}

function info(message, ...params) {
  printLog(message, "INFO", ...params);
}

function warn(message, ...params) {
  printError(message, "WARN", ...params);
}

function error(message, ...params) {
  printError(message, "ERROR", ...params);
}

function fatal(message, ...params) {
  printError(message, "FATAL", ...params);
}

function printLog(message, level, ...params) {
  if (params.length === 0) {
    console.log(`[${level}] ${message}`);
  } else {
    console.log(`[${level}] ${message}`, ...params);
  }
}

function printError(message, level, ...params) {
  if (params.length === 0) {
    console.error(`[${level}] ${message}`);
  } else {
    console.error(`[${level}] ${message}`, ...params);
  }
}

module.exports = {
  trace,
  info,
  warn,
  error,
  fatal
};
