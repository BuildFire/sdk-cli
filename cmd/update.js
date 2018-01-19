var git = require('nodegit');
var fse = require('fs-extra');
var path = require('path');
var isSdkDirectory = require('../tools/isSdkDirectory');
var folderExists = require('../tools/folderExists');
var rmDir = require('../tools/rmDir');


function update(args) {
  var cwd = process.cwd();

  if (!isSdkDirectory()) {
    return console.log('\x1b[31mError: Please run this command inside the SDK\'s folder');
  }

  var targetPath = path.join(cwd, 'tmp');
  if (folderExists(targetPath)) {
    rmDir(targetPath);
  }

  console.log('  \x1b[32mUpdating SDK');


  git.Clone('https://github.com/BuildFire/sdk.git', targetPath)
  .then(function() {
    rmDir(path.join(targetPath, 'plugins'))
    rmDir(path.join(targetPath, '.git'))
    fse.copySync(targetPath, cwd);
    rmDir(targetPath);

    console.log('');
    console.log('  \x1b[32mSDK Updated');
  })

}

module.exports = update;
