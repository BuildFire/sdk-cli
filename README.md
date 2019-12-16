# BuildFire SDK CLI ![](https://api.travis-ci.org/BuildFire/sdk-cli.svg)
**This Command Line Interface** is meant for use with npm to maintain the BuildFire SDK

`npm install buildfire-cli -g`

This will install the `buildfire' command gloabally

#### The BuildFire SDK is a framework that allows developers to develop Plugins on the BuildFire Platform to read more about this please visit us on github http://github.com/buildfire/sdk

## Usage
`buildfire <command>`

### commands:
* `init` Download the latest SDK to a folder called "BuildFireSDK".
* `plugin clone <pluginName>` Clone the plugin into the plugins/ folder. See a full list of open source plugins here http://github.com/buildfire
* `plugin init <pluginName> <template>` Clone the plugin into the plugins/ folder.
* `plugin publish <pluginPath>` Publishes the plugin through developer.buildfire.com directly.
   The pluginPath can be either a folder or a zip file. you can specify any of the following options: 
    * --update (forces updating the plugin)
    * --qa (specfies QA as the target environment)
    * --live (specfies Live as the target environment)
* `update` Download the latest SDK and update the current SDK folder
