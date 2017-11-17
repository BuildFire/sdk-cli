var fs = require('fs');

function folderExists(target) {
  return fs.existsSync(target);
}

module.exports = folderExists;
