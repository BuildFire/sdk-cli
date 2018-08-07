var net = require('net');
var express = require('express');
var exec = require('child_process').exec;
var isSdkDirectory = require('../tools/isSdkDirectory');

function run(args) {
    if (!isSdkDirectory()) {
        return console.log('\x1b[31mError: Please run this command inside the SDK\'s folder');
    }

    var defaultPort = 3030;
    if(Array.isArray(args) && args.length > 1) {
        if (parseInt(args[1]) === NaN) {
            defaultPort= parseInt(args[1]);
        } else {
            console.error('Please provide a proper port number, using a random one');
        }
    }

    getAvailablePort(defaultPort, function(port) {
        var app = express();
        app.use(express.static(process.cwd()));
        app.listen(port, function() {
            openBrowser(port);
        });
    });

    function openBrowser(port) {
        console.log('Server running on [::]:' +  port);

        var isWin = /^win/.test(process.platform),
            cmd2 = (isWin) ? 'start' : 'open';
            cmd2 = cmd2 + ' http://localhost:' + port + '/pluginTester/index.html';

        exec(cmd2, function(error, stdout, stderr) {
            if (error) {
                console.log('error', error);
                console.log('stdout', stdout);
                console.log('stderr', stderr);
            }
        });
    }

    function getAvailablePort (startingAt, cb) {
        function getNextAvailablePort (currentPort, cb) {
            const server = net.createServer();
            server.listen(currentPort, function() {
                server.once('close', function() {
                    cb(currentPort);
                });
                server.close();
            });
            server.on('error', function() {
                getNextAvailablePort(++currentPort, cb);
            });
        }

        getNextAvailablePort(startingAt, cb);
    }

}

module.exports = run;
