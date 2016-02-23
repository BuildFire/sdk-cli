#! /usr/bin/env node
/**
 * Created by Daniel on 8/13/2015.
 */

var http = require('https');
var fs =require('fs');
var AdmZip = require('adm-zip');
var ncp = require('ncp').ncp;
var path = require ("path");
ncp.limit = 32;


function rmdir(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    //console.log('delete folder',dir);
    try{
        fs.rmdirSync(dir)
    }
    catch(e){

    }
};

function downloadRepo(repoName,url) {
    if(!url)
        url="https://github.com/BuildFire/" + repoName + "/archive/master.zip";
    var localZipPath= "_" + repoName + ".zip";

    var file = fs.createWriteStream(localZipPath);
    var request = http.get(url, function(response) {
        if(response.statusCode == 404){
            console.error('invalid repo');
            return;
        }
        else if([301,302].indexOf(response.statusCode) > -1){
            console.warn('file has been redirected');
            downloadRepo(repoName, response.headers.location);
            return;
        }

        console.log('begin downloading zip file...');
        response.pipe(file);
        file.on('finish',function(){
            console.log('downloaded zip.');
            file.close(function(){
                console.log('unzipping...');

                var zip = new AdmZip(localZipPath);
                zip.extractAllTo("./" );
                console.log('delete zip file.');
                fs.unlink(localZipPath);
                console.log('move files to root...');
                ncp('./' + repoName + '-master', './', function (err) {
                    if (err) console.error(err);
                    console.log('clean up...');
                    rmdir('./' + repoName + '-master');
                });
            });


        })
    }).on('error', function(err) { // Handle errors
        console.error(err);
    });
};

/// target : url or appid
function snapshots(target){
    var options = {
        mode:0
        ,delay: 10000
        ,resolutions:[{
            filename: 'images/iPhone4.png'
            ,width: 640
            ,height:960
        },
            {
                filename: 'images/iPhone5.png'
                ,width: 640
                ,height:1136
            },
            {
                filename: 'images/iPhone6.png'
                ,width: 750
                ,height:1334
            },
            {
                filename: 'images/iPhone6Plus.png'
                ,width: 1242
                ,height:2208
            },
            {
                filename: 'images/iPad.png'
                ,width: 1536
                ,height:2048
            },{
                filename: 'images/iPhonePro.png'
                ,width: 2048
                ,height:2732
            }]
    };

    if (target.indexOf('http') != 0 )
        options.appId=target;
    else
        options.url = target;

    var s = require('./tools/screenshot.js');
    s.capture(options,function(err,restults){
        console.log('RESULTS ', restults.length);
    });

}
/* args
node.exe
path
[command]
 */
if(process.argv.length < 3 || ['-help','help','?','/?'].indexOf(process.argv[2].toLowerCase()) >= 0 ){
    console.log('==================================================');
    console.log('arguments:');
    console.log('* create: this will download the latest BuildFire SDK in the current folder');
    console.log('* update: this will download the latest BuildFire SDK and update the current folder');
    console.log('* plugin [plugin name]: this will download the latest version of the indicated plugin in the current folder');
    console.log('* snapshots [appId | url]: this will take pictures of the app home page or url requested at multiple resolutions');
    console.log('// many plugins are open source (MIT) feel free to Fork them on github http://github.com/buildfire');
}
else if(["create","update"].indexOf( process.argv[2].toLowerCase() ) >=0 )
    downloadRepo('sdk');
else if(["snapshots","snapshot"].indexOf( process.argv[2].toLowerCase() ) >=0 )
    snapshots(process.argv[3]);
else if(process.argv[2].toLowerCase() =="plugin"  ) {
    if(process.argv.length < 4)
        console.error('* you forgot to indicate which plugin');
    else
        downloadRepo(process.argv[3]);
}
else
    console.error('unknown command');

