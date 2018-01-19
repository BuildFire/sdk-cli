# BuildFire SDK CLI ![](https://api.travis-ci.org/BuildFire/sdk-cli.svg)
**This Command Line Interface** is meant for use with npm to maintain the BuildFire SDK

`npm install buildfire-sdk -g`

This will install the `buildfire' command gloabally

#### The BuildFire SD is a framework that allows developers to develop Plugins on the BuildFire Platform to read more about this please visit us on github http://github.com/buildfire/sdk

## Usage
`buildfire <command>`

### commands:
* `create` Download the latest SDK to a folder called "BuildFireSDK"
* `plugin <pluginName>` Download latest version of the indicated plugin to the current folder. see a full list of open source plugins here http://github.com/buildfire
* `snapshots <appId|appUrl>` This will take pictures of the app home page or url requested at multiple resolutions
* `init <pluginName> <pluginTemplate>` Create a new plugin (templates: webpack, react)
* `update` Download the latest SDK and update the current SDK folder
