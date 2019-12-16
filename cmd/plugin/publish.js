#! /usr/bin/env node

let http = require('https');
let path = require("path");
let fs = require('fs');
var fse = require('fs-extra');
let ncp = require('ncp').ncp;
let archiver = require('archiver');
let AdmZip = require('adm-zip');
let request = require('request');
let prompt = require('prompt');
let loginTrials = 0;
let apiProxy = null;
ncp.limit = 32;

function publishPlugin(args) {


    let baseApiUrl = 'https://developer.buildfire.com';

    function uploadPlugin(pluginPath, options) {

        if(options && options.customDevServerUrl) {
            baseApiUrl = options.customDevServerUrl;
        }

        function processFolder(processCallback) {
            let pluginName = null;
            try {
                let absolutePath = path.resolve(pluginPath + '/plugin.json');
                let contents = fs.readFileSync(absolutePath);
                // Define to JSON type
                let pluginJSON = JSON.parse(contents);

                pluginName = pluginJSON.pluginName;
            }
            catch (err) {
                console.log('\x1b[41m', 'error fetching plugin.json; ' + err, '\x1b[0m');
                if (processCallback) processCallback(err);
                return;
            }

            console.log('\x1b[43m', 'plugin "' +  pluginName + '" is being prepared for uploading ...', '\x1b[0m');


            let zipPath = 'plugin-' + new Date().getTime() + '.zip';
            let archive = archiver('zip', {
                zlib: {level: 9} // Sets the compression level.
            });

            let output = fs.createWriteStream(zipPath);
            archive.pipe(output);
            archive.directory(pluginPath, false);
            output.on('close', function () {
                login(function (err, user) {
                    if (err) {
                        fs.unlink(zipPath, (err) => {
                            if (processCallback) processCallback(err);
                            if (err) throw err;
                        });
                        return console.log('\x1b[41m', 'error authenticating user', '\x1b[0m');
                    }
                    console.log('uploading plugin ...');
                    if(!options || !options.isUpdate) {
                        publishUserPlugin(pluginName, zipPath, user, options, function(err, result) {
                            setTimeout(function() {
                                if(err) {
                                    console.log('\x1b[41m', 'failed publishing plugin; ' + err, '\x1b[0m');
                                }
                                fs.unlink(zipPath, (err) => {
                                    if (processCallback) processCallback();
                                    if (err) throw err;
                                });
                            }, 0);

                        });
                    } else {
                        updateUserPlugin(pluginName, zipPath, user, options, function(err, result) {
                            setTimeout(function() {
                                if(err) {
                                    console.log('\x1b[41m', 'failed updating plugin; ' + err, '\x1b[0m');
                                }
                                fs.unlink(zipPath, (err) => {
                                    if (processCallback) processCallback();
                                    if (err) throw err;
                                });
                            }, 0);
                        });
                    }
                });
            });
            archive.finalize();
        }

        if(fs.existsSync(pluginPath)) {
            let stats = fs.lstatSync(pluginPath);
            if(stats.isFile()) {
                // unzip
                let zip = new AdmZip(pluginPath);
                let unzipPath = 'plugin-' + new Date().getTime();
                zip.extractAllTo(unzipPath, true);
                pluginPath = unzipPath;
                processFolder(function() {
                    fse.removeSync(unzipPath);
                });
            } else if (stats.isDirectory()) {
                processFolder();
            } else {
                console.log('\x1b[41m', 'unrecognized path: ' + pluginPath, '\x1b[0m');
            }
        } else {
            console.log('\x1b[41m', 'unable to locate plugin at path: ' + pluginPath, '\x1b[0m');
        }
    }

    function login(callback) {
        prompt.start();
        prompt.get({
            properties: {
                username: {
                    required: true
                },
                password: {
                    hidden: true,
                    required: true
                }
            }
        }, function (err, result) {
            if (err) {
                return; // user cancelled or input not captured
            }
            request({
                    method: 'POST',
                    preambleCRLF: true,
                    postambleCRLF: true,
                    proxy: apiProxy,
                    uri: baseApiUrl + '/api/login/developerPortal/',
                    headers: {
                        'Origin': baseApiUrl,
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Encoding': 'gzip, deflate'
                    },
                    body: {email: result.username, password: result.password},
                    json: true
                },
                function (error, response, body) {
                    if (body && body.auth) {
                        callback(null, body);
                    } else {
                        loginTrials++;
                        if(loginTrials > 2) {
                            callback('failed logging in');
                            console.log('\x1b[41m', 'try logging in using the developer portal', '\x1b[0m');
                        } else {
                            console.log('\x1b[41m', 'could not authenticate user', '\x1b[0m');
                            login(callback);
                        }
                    }
                });
        });
    }

    function publishUserPlugin(pluginName, zipPath, user, options, callback) {
        request({
                method: 'POST',
                preambleCRLF: true,
                postambleCRLF: true,
                proxy: apiProxy,
                uri: baseApiUrl + '/api/pluginTypes/',
                headers: {
                    'Origin': baseApiUrl,
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Encoding': 'gzip, deflate',
                    'userToken': user.userToken,
                    'auth': user.auth
                },
                formData: {
                    file: fs.createReadStream(zipPath)
                }
            },
            function (error, response, body) {
                if (error) {
                    return console.error('upload failed:', error);
                }
                if (response.statusCode >= 400 || response.statusCode === 0) {

                    let jsonResult = undefined;
                    try {
                        jsonResult = JSON.parse(body);
                    }
                    catch (err) {

                    }
                    if (jsonResult && jsonResult.message) {
                        if (jsonResult.code === 'checkPluginTypeUniqueness') {
                            console.log('\x1b[41m', 'a plugin already exists with the same name. you can set --update to prevent this prompt', '\x1b[0m');
                            prompt.start();
                            prompt.get({
                                properties: {
                                    forceUpdate: {
                                        description: 'Update your exiting plugin',
                                        required: true,
                                        type: 'boolean',
                                        default: false,
                                        message: "please specify [true|false]",
                                    }
                                }
                            }, function (err, result) {
                                if (err) {
                                    callback(err, result);
                                    return; // do not update
                                }
                                if (result.forceUpdate) {
                                    console.log('updating plugin ...');
                                    updateUserPlugin(pluginName, zipPath, user, options, function(err, result) {
                                        callback(err, result);
                                    });
                                } else {
                                    callback(err, result);
                                }
                            });
                        } else {
                            callback(jsonResult.message);
                            console.log('\x1b[41m', 'failed: ' + jsonResult.message, '\x1b[0m');
                        }
                    } else {
                        callback('an error has occurred');
                        console.log('\x1b[41m', 'an error has occurred: ', body, '\x1b[0m');
                    }
                } else {
                    callback(null, 'uploaded successfully');
                    console.log('\x1b[45m', 'successfully uploaded plugin', '\x1b[0m');
                }
            });
    }

    function updateUserPlugin(pluginName, zipPath, user, options, callback) {
        getPluginType(pluginName, user, function(err, pluginType) {
            if(err) {
                callback(err);
                return;
            }
            let requestUpdate = function() {
                let formData = {
                    file: fs.createReadStream(zipPath),
                    pluginTypeToken: pluginType.token
                };
                if (options && options.isQA) {
                    formData.environmentType = "QA";
                }
                request({
                        method: 'POST',
                        preambleCRLF: true,
                        postambleCRLF: true,
                        proxy: apiProxy,
                        uri: baseApiUrl + '/api/pluginTypes/update',
                        headers: {
                            'Origin': baseApiUrl,
                            'Accept': 'application/json, text/plain, */*',
                            'Accept-Encoding': 'gzip, deflate',
                            'userToken': user.userToken,
                            'auth': user.auth
                        },
                        formData: formData
                    },
                    function (error, response, body) {
                        if (error) {
                            return console.error('upload failed:', error);
                        }
                        if (response.statusCode >= 400 || response.statusCode === 0) {

                            let jsonResult = undefined;
                            try {
                                jsonResult = JSON.parse(body);
                            }
                            catch (err) {
                            }
                            if (jsonResult && jsonResult.message) {
                                callback(jsonResult.message);
                                console.log('\x1b[41m', 'failed: ' + jsonResult.message, '\x1b[0m');
                            } else {
                                callback('an error has occurred');
                                console.log('\x1b[41m', 'an error has occurred: ', body, '\x1b[0m');
                            }
                        } else {
                            callback(null, 'uploaded successfully');
                            console.log('\x1b[45m', 'successfully updated plugin', '\x1b[0m');
                        }
                    });
            };
            if (options && options.isQA == null) {
                prompt.start();
                prompt.get({
                    properties: {
                        env: {
                            description: "environment [QA|Live]. you can set --qa or --live to prevent this prompt",
                            required: true,
                            default: "QA",
                            message: "select [QA|Live] or default to QA",
                            conform: function (value) {
                                return value && (value.toUpperCase() === 'QA' || value.toUpperCase() === 'Live')
                            },
                        },
                    }
                }, function (err, result) {
                    if (err) {
                        callback(err, result);
                        return; // do not update
                    }
                    options.isQA = result.env.toUpperCase() === 'QA';
                    requestUpdate();
                });
            } else {
                requestUpdate();
            }
        });
    }

    function getPluginType(pluginName, user, callback) {
        // TODO: replace with a dedicated api
        request({
                method: 'GET',
                proxy: apiProxy,
                uri: baseApiUrl + '/api/pluginTypes/search?pageIndex=1&pageSize=200',
                gzip: true,
                headers: {
                    'Origin': baseApiUrl,
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Encoding': 'gzip, deflate',
                    'userToken': user.userToken,
                    'auth': user.auth
                }
            },
            function (error, response, body) {
                let jsonResult = undefined;
                if (error) {
                    return console.error('upload failed:', error);
                }
                if (response.statusCode >= 400 || response.statusCode === 0) {
                    try {
                        jsonResult = JSON.parse(body);
                    }
                    catch (err) {
                    }
                    if (jsonResult && jsonResult.message) {
                        callback(jsonResult.message);
                        console.log('\x1b[41m', 'failed: ' + jsonResult.message, '\x1b[0m');
                    } else {
                        callback('an error has occurred');
                        console.log('\x1b[41m', 'an error has occurred: ', body, '\x1b[0m');
                    }
                } else {
                    try {
                        jsonResult = JSON.parse(body);
                    }
                    catch (err) {
                        callback('parsing error');
                        return;
                    }
                    if (jsonResult && jsonResult.data) {
                        for(let index = 0; index < jsonResult.data.length; index++) {
                            if(jsonResult.data[index] && jsonResult.data[index].name === pluginName) {
                                callback(null, jsonResult.data[index]);
                                return;
                            }
                        }
                    }
                    callback('cannot find registered plugin type for user');
                }
            });
    }

    let hasUpdateFlag = args.indexOf('--update') > -1;
    let hasQAFlag = args.indexOf('--qa') > -1;
    let hasLiveFlag = args.indexOf('--live') > -1;
    let isQA = null;
    let customDevServerUrl = null;
    let customDevServerFlagIndex = args.indexOf('--server');
    if(customDevServerFlagIndex > -1 && args[customDevServerFlagIndex + 1]) {
        customDevServerUrl = args[customDevServerFlagIndex + 1];
    }
    if(hasQAFlag !== hasLiveFlag) { // if both supplied ignore
        isQA = hasQAFlag;
    }

    let options = {
        isUpdate: hasUpdateFlag,
        isQA: isQA,
        customDevServerUrl: customDevServerUrl
    };

    uploadPlugin(args[2], options);
}



module.exports = publishPlugin;