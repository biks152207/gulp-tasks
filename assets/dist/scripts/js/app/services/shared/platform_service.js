(function () {
    app.service('platformService', function () {

        var self = this;
        var platform = ionic.Platform.platform();

        self.isMobileDevice = function(){

            return (platform === 'android' || platform === 'ios') ;

        };

        self.getPlatform=function(){
            return platform;
        }

    });
}).call(this);
