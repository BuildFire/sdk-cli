#! /usr/bin/env node

console.log(' ______       _ _     _______ _          ');
console.log(' | ___ \\     (_) |   | |  ___(_)         ');
console.log(' | |_/ /_   _ _| | __| | |_   _ _ __ ___ ');
console.log(' | ___ \\ | | | | |/ _` |  _| | | \'__/ _ \\');
console.log(' | |_/ / |_| | | | (_| | |   | | | |  __/');
console.log(' \\____/ \\__,_|_|_|\\__,_\\_|   |_|_|  \\___|');
console.log('');

var http = require('https');
var fs =require('fs');
var AdmZip = require('adm-zip');
var ncp = require('ncp').ncp;
var path = require ("path");
ncp.limit = 32;

var args = process.argv.slice(2);

switch (args[0]) {
    case 'download':
        return require('./cmd/download')(args);
    case 'plugin':
        return require('./cmd/plugin')(args);
    case 'snapshots':
        return require('./cmd/snapshots')(args);
    case 'create':
        return require('./cmd/create')(args);
    case 'run':
        return require('./cmd/run')(args);
    case 'build':
        return require('./cmd/build')(args);
    case 'update':
        return require('./cmd/update')(args);
    default:
        return require('./cmd/default')(args);
}
