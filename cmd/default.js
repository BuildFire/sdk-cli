function defaultCmd() {
  console.log('Usage:');
  console.log('');
  console.log('  \x1b[90m$ \x1b[34mbuildfire <command>\x1b[0m');
  console.log('');
  console.log('');
  console.log('Commands:');
  console.log('');
  console.log('  \x1b[34minit\x1b[90m ...........................................\x1b[37m Creates a folder \'BuildFireSDK\' and installs the SDK to it.');
  console.log('  \x1b[34mrun [port]\x1b[90m .....................................\x1b[37m Start the plugin tester. Optionally you can pass along a port number to host from');
  console.log('  \x1b[34mplugin <command>');
  console.log('  \x1b[34m       init <pluginName> [template|default]\x1b[90m ....\x1b[37m Initialize a new plugin (templates: webpack, react, default).');
  console.log('  \x1b[34m       clone <pluginName>\x1b[90m ......................\x1b[37m Clone the plugin into the plugins/ folder.');
  console.log('  \x1b[34m       publish <pluginPath>\x1b[90m .............\x1b[37m Publishes the plugin through developer.buildfire.com directly. The pluginPath can be either a folder (current if missing) or a zip file. you can specify any of the following options:');
  console.log('  \x1b[34m         --update (forces updating the plugin)');
  console.log('  \x1b[34m         --qa (specfies QA as the target environment)');
  console.log('  \x1b[34m         --prod (specfies Production as the target environment)');
  //console.log('  \x1b[34msnapshots [appId | url]\x1b[90m ................\x1b[37m Take pictures of the app home page or url requested at multiple resolutions.');
  // console.log('  \x1b[34mbuild <pluginName>\x1b[90m ....................\x1b[37m Build the selected plugin \x1b[90m(Must be supported by template).');
  console.log('  \x1b[34mupdate\x1b[90m .........................................\x1b[37m Update the SDK on the current folder.');
  console.log('');
}


module.exports = defaultCmd;
