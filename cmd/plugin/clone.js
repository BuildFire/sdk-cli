var path = require('path');
var git = require('simple-git/promise')();
var isSdkDirectory = require('../../tools/isSdkDirectory');
var folderExists = require('../../tools/folderExists');
var rmDir = require('../../tools/rmDir');


function clonePlugin(args) {
  var cwd = process.cwd();

  if (!isSdkDirectory()) {
    return console.log('\x1b[31mError: Please run this command inside the SDK\'s folder');
  }

  if (!args[2]) {
    return console.log('\x1b[31mUsage: $ buildfire plugin add <command>');
  }

  var targetPath = path.join(cwd, 'plugins', args[2]);

  if (folderExists(targetPath)) {
    return console.log('\x1b[31mError: Plugin is already inside plugins folder');
  }

  console.log('  \x1b[32mDownloading plugin ' + args[2] + '\x1b[0m');

  git.clone('https://github.com/BuildFire/' + args[2] + '.git', targetPath)
  .then(function() {
    console.log('');
    console.log('  \x1b[34mNext steps:');
    console.log('  \x1b[1m\x1b[37mcd plugins/' + args[2]);
  }).catch(function(err) {
    return console.log('  \x1b[31mError: Invalid plugin name or no permissions');
  })
}

module.exports = clonePlugin;
