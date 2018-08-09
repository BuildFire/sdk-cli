var fs = require('fs');

function isSdkDirectory() {
  var cwd = process.cwd();

  var data = fs.readdirSync(cwd);

  data = data.map(item => item.toLowerCase());

  if (data.indexOf('scripts') > -1 &&
      data.indexOf('plugintester') > -1 &&
      data.indexOf('plugins') > -1 &&
      data.indexOf('package.json') > -1) {
    return true;
  }

  return false;
}

module.exports = isSdkDirectory;
