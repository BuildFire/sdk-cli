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


var rmdir = function(dir) {
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

var download = function(url,localZipPath) {

    var file = fs.createWriteStream(localZipPath);
    var request = http.get(url, function(response) {
        if([301,302].indexOf(response.statusCode) > -1){
            console.warn('file has been redirected');
            download(response.headers.location,localZipPath);
            return;
        }

        console.log('begin downloading zip file...');
        response.pipe(file);
        file.on('finish',function(){
            console.log('downloaded zip.');
            file.close(function(a){
                console.log(a);
                console.log('unzipping...');
                var zip = new AdmZip(localZipPath);
                console.log('upzipping...');
                zip.extractAllTo("./" );
                console.log('delete zip file.');
                fs.unlink(localZipPath);
                console.log('move files to root...');
                ncp('./sdk-master', './', function (err) {
                    if (err) console.error(err);
                    console.log('clean up...');
                    rmdir('./sdk-master');
                    rmdir('./sdk-master');
                });
            });


        })
    }).on('error', function(err) { // Handle errors
        console.error(err);
    });
};

/* args
node.exe
path
[command]
 */
if(process.argv.length < 3 || ['-help','help','?','/?'].indexOf(process.argv[2].toLowerCase()) >= 0 ){
    console.log('==================================================');
    console.log('arguments:');
    console.log('* create: this will download latest BuildFire SDK in the current folder');
}
else if(process.argv[2].toLowerCase() == "create")
    download("https://github.com/BuildFire/sdk/archive/master.zip","./_tempsdk.zip");
else
    console.error('unknown command');

