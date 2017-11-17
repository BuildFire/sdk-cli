var path = require('path');
var git = require('nodegit');
var isSdkDirectory = require('../tools/isSdkDirectory');
var folderExists = require('../tools/folderExists');
var rmDir = require('../tools/rmDir');


function plugin(args) {
  var cwd = process.cwd();

  if (!isSdkDirectory()) {
    return console.log('\x1b[31mError: Please run this command inside the SDK\'s folder');
  }

  if (!args[1]) {
    return console.log('\x1b[31mUsage: $ buildfire plugin <pluginName>');
  }

  var targetPath = path.join(cwd, 'plugins', args[1]);

  if (folderExists(targetPath)) {
    return console.log('\x1b[31mError: Plugin is already inside plugins folder');
  }

  console.log('  \x1b[32mDownloading plugin ' + args[1] + '\x1b[0m');

  git.Clone('https://github.com/BuildFire/' + args[1] + '.git', targetPath)
  .then(function() {
    rmDir(path.join(targetPath, '.git'));

    console.log('');
    console.log('  \x1b[34mNext steps:');
    console.log('  \x1b[1m\x1b[37mcd plugins/' + args[1]);
  }).catch(function(err) {
    return console.log('  \x1b[31mError: Invalid plugin name or no permissions');
  })
}

module.exports = plugin;
