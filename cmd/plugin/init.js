var path = require('path');
var git = require('simple-git/promise')();
var folderExists = require('../../tools/folderExists');
var isSdkDirectory = require('../../tools/isSdkDirectory');
var rmDir = require('../../tools/rmDir');
var fs = require('fs');

function isURL(str) {
  var pattern = new RegExp(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/)
  return str && pattern.test(str);
}

function isDirectory(str) {
  var stats = fs.statSync(str);
  return stats.isDirectory();
}

function initPlugin(args) {
    var cwd = process.cwd();

    if (!args[2]) {
      return console.log('\x1b[31mError: Please provide a plugin name');
    }

    // Default to default template if none is specified
    if (!args[3]) {
      args[3] = 'default';
    }

    var targetPath = path.join(cwd, 'plugins', args[2]);

    if (!isSdkDirectory()) {
      return console.log('\x1b[31mError: Please run this command in the SDKs root directory');
    }

    if (folderExists(targetPath)) {
      return console.log('\x1b[31mError: Plugin folder with that name already exists');
    }

    console.log('\x1b[32mCreating Plugin ' + args[2] + ' with template ' + args[3] + '\x1b[0m');

    var gitUrl = isURL(args[3]) || isDirectory(args[3])
      ? args[3]
      : `https://github.com/BuildFire/${args[3]}PluginTemplate.git`;
    git.clone(gitUrl, targetPath)
    .then(function() {
      rmDir(path.join(targetPath, '.git'));

      console.log('');
      console.log('  \x1b[34mNext steps:');
      console.log('  \x1b[1m\x1b[37mcd plugins/' + args[2]);
      if (args[3] !== 'default') {
        console.log('  \x1b[1m\x1b[37mnpm install');
        console.log('  \x1b[1m\x1b[37mnpm start');
      }
    }).catch(err => console.error(err));
}

module.exports = initPlugin;
