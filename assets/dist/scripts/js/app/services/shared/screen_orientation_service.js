(function () {
    app.service('orientation', ["$rootScope", "screenSize", function ($rootScope, screenSize) {

        var self = this;

        self.setOrientation = function(){
            if(ionic.Platform.isIPad()){

            }
            else if(ionic.Platform.isIOS()  || ionic.Platform.isAndroid()){
                //screen.lockOrientation('portrait');
            }

        };

        window.addEventListener("orientationchange", function() {

            $rootScope.desktop = screenSize.is('md,lg');
            $rootScope.mobile = screenSize.is('xs, sm');

        }, false);
    }]);
}).call(this);
