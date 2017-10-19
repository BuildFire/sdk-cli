var rimraf = require('rimraf');

function rmDir(target) {
  try {
    rimraf.sync(target);
  } catch (err) {
    console.error(err);
  }
}

module.exports = rmDir;
