var path = require('path');
var git = require('simple-git/promise')();
var folderExists = require('../tools/folderExists');
var rmDir = require('../tools/rmDir');


function initSdk(args) {
  var cwd = process.cwd();

    var targetPath = path.join(cwd, 'BuildFireSDK');

    if (folderExists(targetPath)) {
      return console.log('\x1b[31mError: Folder BuildFireSDK already exists');
    }

    console.log('  \x1b[32mDownloading SDK\x1b[0m');

    git.clone('https://github.com/BuildFire/sdk.git', targetPath)
    .then(function() {
      rmDir(path.join(targetPath, '.git'));
      rmDir(path.join(targetPath, 'plugins/myPlugin'));
      rmDir(path.join(targetPath, 'plugins/testPlugin'));

      console.log('');
      console.log('  \x1b[34mNext steps:');
      console.log('  \x1b[1m\x1b[37mcd BuildFireSDK');
      console.log('  \x1b[1m\x1b[37mbuildfire plugin init <pluginName> <pluginTemplate>');
    });
}

module.exports = initSdk;
