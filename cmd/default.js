function defaultCmd() {
  console.log('Usage:');
  console.log('');
  console.log('  \x1b[90m$ \x1b[34mbuildfire <command>\x1b[0m');
  console.log('');
  console.log('');
  console.log('Commands:');
  console.log('');
  console.log('  \x1b[34minit\x1b[90m ...................................\x1b[37m Creates a folder \'BuildFireSDK\' and installs the SDK to it.');
  console.log('  \x1b[34mrun <port>\x1b[90m .............................\x1b[37m Start the plugin tester. Defaults to port 8000.');
  console.log('  \x1b[34mplugin <command>');
  console.log('  \x1b[34m       init <pluginName> <template>\x1b[90m ....\x1b[37m Initialize a new plugin (templates: webpack, react).');
  console.log('  \x1b[34m       clone <pluginName>\x1b[90m ..............\x1b[37m Clone the plugin into the plugins/ folder.');
  //console.log('  \x1b[34msnapshots [appId | url]\x1b[90m ................\x1b[37m Take pictures of the app home page or url requested at multiple resolutions.');
  // console.log('  \x1b[34mbuild <pluginName>\x1b[90m ....................\x1b[37m Build the selected plugin \x1b[90m(Must be supported by template).');
  console.log('  \x1b[34mupdate\x1b[90m .................................\x1b[37m Update the SDK on the current folder.');
  console.log('');
}


module.exports = defaultCmd;
