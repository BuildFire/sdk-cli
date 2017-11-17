var path = require('path');
var git = require('nodegit');
var folderExists = require('../tools/folderExists');
var isSdkDirectory = require('../tools/isSdkDirectory');
var rmDir = require('../tools/rmDir');


function init(args) {
  var cwd = process.cwd();

    var targetPath = path.join(cwd, 'plugins', args[1]);

    if (!isSdkDirectory()) {
      return console.log('\x1b[31mError: Please run this command in the SDKs root directory');
    }

    if (folderExists(targetPath)) {
      return console.log('\x1b[31mError: Plugin folder with that name already exists');
    }

    if (!args[1] || !args[2]) {
      return console.log('\x1b[31mError: Please provide a plugin name and plugin template');
    }

    console.log('\x1b[32mCreating Plugin ' + args[1] + '\x1b[0m');

    git.Clone('https://github.com/BuildFire/plugin-template-' + args[2] + '.git', targetPath)
    .then(function() {
      rmDir(path.join(targetPath, '.git'));

      console.log('');
      console.log('  \x1b[34mNext steps:');
      console.log('  \x1b[1m\x1b[37mcd plugins/' + args[1]);
      console.log('  \x1b[1m\x1b[37mnpm install');
      console.log('  \x1b[1m\x1b[37mnpm start');
    }).catch(err => console.error(err));
}

module.exports = init;
