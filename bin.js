#! /usr/bin/env node
/**
 * Created by Daniel on 8/13/2015.
 */
var http = require('https'),
    fs = require('fs'),
    AdmZip = require('adm-zip'),
    ncp = require('ncp').ncp,
    path = require("path"),
    rmdir = require('rimraf');
var argv = require('yargs')
    .usage('npm <command>')
    .command('install', 'This will download the latest BuildFire SDK in the current folder')
    .command('update', 'This will download the latest BuildFire SDK and update the current folder')
    .example('$0 install -p peoplePlugin', 'This will download people plugin in the current folder')
    .options({
        'p': {
            alias: 'plugin',
            describe: 'This will download the latest version of the indicated plugin in the current folder',
            type: 'string'
        }
    })
    .help('h')
    .alias('h', 'help')
    .version('1.0.0', 'version', 'More info: https://github.com/BuildFire/sdk')
    .alias('version', 'v')
    .epilog("Copyright 2015 Buildfire")
    .showHelpOnFail(false, 'whoops, something went wrong! run with --help')
    .argv;

ncp.limit = 32;

var downloadRepo = function (repoName, url) {
    if (!url)
        url = "https://github.com/BuildFire/" + repoName + "/archive/master.zip";
    var localZipPath = "_" + repoName + ".zip";

    var file = fs.createWriteStream(localZipPath);
    var request = http.get(url, function (response) {
        if (response.statusCode == 404) {
            console.error('invalid repo');
            return;
        }
        else if ([301, 302].indexOf(response.statusCode) > -1) {
            console.warn('file has been redirected');
            downloadRepo(repoName, response.headers.location);
            return;
        }
        console.log('begin downloading zip file...');
        response.pipe(file);
        file.on('finish', function () {
            console.log('downloaded zip.');
            file.close(function () {
                console.log('unzipping...');

                var zip = new AdmZip(localZipPath);
                zip.extractAllTo("./");
                console.log('delete zip file.');
                fs.unlink(localZipPath);
                console.log('move files to root...');
                ncp('./' + repoName + '-master', './', function (err) {
                    if (err) console.error(err);
                    console.log('clean up...');
                    rmdir('./' + repoName + '-master', function (error) {
                        if (error)
                            throw (error);
                    });
                });
            });


        })
    }).on('error', function (err) { // Handle errors
        console.error(err);
    });
};

/* args
 node.exe
 path
 [command]
 */
var command = argv._[0];
switch (command) {
    case "install":
        console.log("install",argv)
        if (argv.p) {
            console.log("peoplePlugin")
            downloadRepo(argv.p);
        } else {
            console.log("sdk")
            downloadRepo('sdk');
        }
        break;
    case "update":
        downloadRepo('sdk');
        break;
    default :
        console.error('unknown command');
}

