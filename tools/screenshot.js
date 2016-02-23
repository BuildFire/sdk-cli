/**
 * Created by danielhindi on 12/22/15.
 */
var phantom = require('phantom');
var async= require("async");

module.exports = {
    /*
     * */
    capture: function(options, callback){
        if(! options.url && options.appId)
            options.url ="http://app.buildfire.com/app/index.html?appId=" + options.appId + "&mode=" + options.mode;
        var ph;
        function snap(res,callback){
            ph.createPage(function (page) {

                page.set('viewportSize',res);
                page.open(options.url, function (status) {
                    console.log(options.url , " opened? ", status);

                    setTimeout(function(){ /// we can change this to look for something in the dom to let you know its loaded
                        console.log('take picture at ', res.width,res.height);
                        page.render(res.filename,function(){
                            console.log('file created ', res.filename);
                            callback(null,res.filename);
                        });

                    },options.delay?options.delay:5000);

                });
            });
        }

        phantom.create(function (p) {
            ph=p;
            async.map(options.resolutions,snap,function(err,results){
                console.log('exit!');
                ph.exit();
                callback(err,results);
            })
        });
    }


};