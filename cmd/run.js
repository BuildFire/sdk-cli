var exec = require('child_process').exec;

function run(args) {

    var isWin = /^win/.test(process.platform),
        cmd = 'http-server',
        cmd2 = (isWin) ? 'start' : 'open';
        cmd2 = cmd2 + ' http://localhost:8080/pluginTester/index.html';

    //Note: callback is only run on error
    exec(cmd, function(error, stdout, stderr) {
        if(error){
            console.log('error', error);
            console.log('stdout', stdout);
            console.log('stderr', stderr);
            return;
        }
    });

    console.log('Running plugin tester');

    exec(cmd2, function(error, stdout, stderr) {
        if(error){
            console.log('error', error);
            console.log('stdout', stdout);
            console.log('stderr', stderr);
        }
    });
}

module.exports = run;
