var screenshot = require('../tools/screenshot');

function snapshots(args){
    var options = {
        mode:0
        ,delay: 10000
        ,resolutions:[{
            filename: 'images/iPhone4.png'
            ,width: 640 / 2
            ,height:960 / 2
        },
            {
                filename: 'images/iPhone5.png'
                ,width: 640 /2
                ,height:1136 /2
            },
            {
                filename: 'images/iPhone6.png'
                ,width: 750 /2
                ,height:1334 /2
            },
            {
                filename: 'images/iPhone6Plus.png'
                ,width: 1242 / 2
                ,height:2208 / 2
            },
            {
                filename: 'images/iPad.png'
                ,width: 1536 /2
                ,height:2048 /2
            },{
                filename: 'images/iPhonePro.png'
                ,width: 2048 / 2
                ,height:2732 /2
            }]
    };

    if (args[1].indexOf('http') != 0 )
        options.appId=args[1];
    else
        options.url = args[1];

    screenshot.capture(options, function(err, results) {
        if (err) return console.error(err);
        console.log('Results ',  results.length);
    });

}

module.exports = snapshots;
