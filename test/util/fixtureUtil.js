const fs = require("fs");
const path = require("path");

/**
 *
 * @param fixturePath - path to fixture <b>relative to test folder</b>
 * @returns {string}
 */
function readFixtureAsStringSync(fixturePath) {
  fixturePath = path.join(__dirname, `../${fixturePath}`);
  return fs.readFileSync(fixturePath, "utf8");
}

module.exports = {
  readFixtureAsStringSync,
};
