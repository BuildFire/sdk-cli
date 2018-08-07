var fs = require('fs');

function isSdkDirectory() {
  var cwd = process.cwd();

  var data = fs.readdirSync(cwd);

  if (data.indexOf('scripts') > -1 &&
      (data.indexOf('PluginTester') > -1 || data.indexOf('pluginTester') > -1)
      data.indexOf('plugins') > -1 &&
      data.indexOf('package.json') > -1) {
    return true;
  }

  return false;
}

module.exports = isSdkDirectory;
