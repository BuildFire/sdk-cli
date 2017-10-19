function defaultCmd() {
  console.log('Usage:');
  console.log('');
  console.log('  \x1b[90m$ \x1b[34mbuildfire <command>\x1b[0m');
  console.log('');
  console.log('');
  console.log('Commands:');
  console.log('');
  console.log('  \x1b[34mdownload\x1b[90m ..............................\x1b[37m Download the SDK');
  console.log('  \x1b[34mplugin <pluginName>\x1b[90m ...................\x1b[37m Download the latest version of the plugin and place it in the plugins folder');
  console.log('  \x1b[34msnapshots [appId | url]\x1b[90m ...............\x1b[37m Take pictures of the app home page or url requested at multiple resolutions');
  // console.log('  \x1b[34mcreate <template> <pluginName>\x1b[90m ........\x1b[37m Create a new plugin \x1b[90m(templates: webpack, react, angular)');
  // console.log('  \x1b[34mrun [pluginName]\x1b[90m ......................\x1b[37m Starts the plugin viewer \x1b[90m(pluginName required only for webpack based templates)');
  // console.log('  \x1b[34mbuild <pluginName>\x1b[90m ....................\x1b[37m Build the selected plugin \x1b[90m(Must be supported by template)');
  console.log('  \x1b[34mupdate\x1b[90m ................................\x1b[37m Update the SDK on the current folder');
  console.log('');
}


module.exports = defaultCmd;
