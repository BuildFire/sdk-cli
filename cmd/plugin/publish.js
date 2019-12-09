#! /usr/bin/env node

var http = require('https');
var path = require("path");
var fs = require('fs');
var ncp = require('ncp').ncp;
var archiver = require('archiver');
var request = require('request');
var prompt = require('prompt');
var loginTrials = 0;
var apiProxy = null;
ncp.limit = 32;

function publishPlugin(args) {


    var baseApiUrl = 'https://developer.buildfire.com';

    function uploadPlugin(pluginPath, isUpdate, isUat) {

        if(isUat) {
            baseApiUrl = 'http://uat-app.buildfire.com:89';
        }

        console.log("path:" + pluginPath);
        var pluginName = null;
        try {
            var absolutePath = path.resolve(pluginPath + '/plugin.json');
            var contents = fs.readFileSync(absolutePath);
            // Define to JSON type
            var pluginJSON = JSON.parse(contents);

            pluginName = pluginJSON.pluginName;
        }
        catch (err) {
            console.log('\x1b[41m', 'error fetching plugin.json; ' + err, '\x1b[0m');
            return;
        }

        console.log('\x1b[43m', 'plugin "' +  pluginName + '" is being prepared for uploading ...', '\x1b[0m');


        var zipPath = 'plugin-' + new Date().getTime() + '.zip';
        var archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });

        var output = fs.createWriteStream(zipPath);
        archive.pipe(output);
        archive.directory(pluginPath, false);
        output.on('close', function () {
            login(function (err, user) {
                if (err) {
                    return console.log('\x1b[41m', 'error authenticating user', '\x1b[0m');
                }
                console.log('uploading plugin ...');
                if(!isUpdate) {
                    publishUserPlugin(pluginName, zipPath, user, function(err, result) {
                        if(err) {
                            console.log('\x1b[41m', 'failed publishing plugin; ' + err, '\x1b[0m');
                        }
                        fs.unlink(zipPath);
                    });
                } else {
                    updateUserPlugin(pluginName, zipPath, user, function(err, result) {
                        if(err) {
                            console.log('\x1b[41m', 'failed updating plugin; ' + err, '\x1b[0m');
                        }
                        fs.unlink(zipPath);
                    });
                }
            });
        });
        archive.finalize();
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

    function publishUserPlugin(pluginName, zipPath, user, callback) {
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
                if (response.statusCode >= 400 || response.statusCode == 0) {

                    var jsonResult = undefined;
                    try {
                        jsonResult = JSON.parse(body);
                    }
                    catch (err) {

                    }
                    if (jsonResult && jsonResult.message) {
                        if (jsonResult.code === 'checkPluginTypeUniqueness') {
                            console.log('\x1b[41m', 'a plugin already exists with the same name', '\x1b[0m');
                            prompt.start();
                            prompt.get({
                                properties: {
                                    forceUpdate: {
                                        description: 'Update your exiting plugin',
                                        required: true,
                                        type: 'boolean',
                                        default: false
                                    }
                                }
                            }, function (err, result) {
                                if (err) {
                                    return; // do not update
                                }
                                if (result.forceUpdate) {
                                    console.log('updating plugin ...');
                                    updateUserPlugin(pluginName, zipPath, user, function(err, result) {
                                        callback(err, result)
                                    });
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

    function updateUserPlugin(pluginName, zipPath, user, callback) {

        getPluginType(pluginName, user, function(err, pluginType) {
            if(err) {
                callback(err);
                return;
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
                    formData: {
                        file: fs.createReadStream(zipPath),
                        pluginTypeToken: pluginType.token
                    }
                },
                function (error, response, body) {
                    if (error) {
                        return console.error('upload failed:', error);
                    }
                    if (response.statusCode >= 400 || response.statusCode == 0) {

                        var jsonResult = undefined;
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
        });
    }

    function getPluginType(pluginName, user, callback) {
        // TODO: replace with a dedicated api
        request({
                method: 'GET',
                proxy: apiProxy,
                uri: baseApiUrl + '/api/pluginTypes/search?pageIndex=1&pageSize=100',
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
                var jsonResult = undefined;
                if (error) {
                    return console.error('upload failed:', error);
                }
                if (response.statusCode >= 400 || response.statusCode == 0) {
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
                        for(var index = 0; index < jsonResult.data.length; index++) {
                            if(jsonResult.data[index] && jsonResult.data[index].name == pluginName) {
                                callback(null, jsonResult.data[index]);
                                return;
                            }
                        }
                    }
                    callback('cannot find registered plugin type for user');
                }
            });
    }

    uploadPlugin(args[2], args[3] === '--update' || args[4] === '--update', args[3] === '--uat' || args[4] === '--uat');
}



module.exports = publishPlugin;