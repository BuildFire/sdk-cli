var path = require('path');
var git = require('simple-git/promise')();
var folderExists = require('../../tools/folderExists');
var isSdkDirectory = require('../../tools/isSdkDirectory');
var rmDir = require('../../tools/rmDir');


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

    console.log('\x1b[32mCreating Plugin ' + args[2] + ' with tempalte ' + args[3] + '\x1b[0m');

    git.clone('https://github.com/BuildFire/' + args[3] + 'PluginTemplate.git', targetPath)
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
