/**
 * Created by danielhindi on 12/22/15.
 */
var phantom = require('phantom');
var async= require("async");

module.exports = {
    /*
     * */
    capture: function(options, callback){
        if(!options.url && options.appId)
            options.url ="http://app.buildfire.com/app/index.html?appId=" + options.appId + "&mode=" + options.mode;

        if(!options.url) {
            console.error("no url provided");
            callback("no url provided");
            return;
        }
        else{
            console.log('============= fix hash, search sequence ===============');
            var hashPos = options.url.indexOf("#");
            var searchPos = options.url.indexOf("?");
            if( searchPos > 0 && hashPos > searchPos) {
                var segments= options.url.split("?");
                var newUrl = segments[0];
                segments = segments[1].split("#");
                options.hash=segments[1];
                newUrl +=  "?" + segments[0];
                console.warn("============= new url ", newUrl,'===================');
                options.url = newUrl;
            }

        }

        var ph;
        function snap(res,callback){
            ph.createPage(function (page) {

                page.set('viewportSize',res);
                page.open(options.url, function (status) {
                    page.evaluate('window.location.hash="' + options.hash + '"');
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