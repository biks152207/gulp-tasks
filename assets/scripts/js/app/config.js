(function () {
    app.config(['$httpProvider', 'toastrConfig', '$ionicConfigProvider', 'msdElasticConfig', '$ionicLoadingConfig', '$compileProvider', 'moment',
        function ($httpProvider, toastrConfig, $ionicConfigProvider, msdElasticConfig, ionicLoadingConfig , $compileProvider, moment) {

            if(window.cordova){
                console.log(_.keys(window.cordova.plugins));
                //window.cordova.plugins.Rollbar.init();
            }


        $httpProvider.interceptors.push('authInterceptor');
            $httpProvider.interceptors.push('httpAllInterceptor');

        //For production performance
        //$compileProvider.debugInfoEnabled(false);
        //$httpProvider.useApplyAsync(true);

        angular.extend(toastrConfig, {
            positionClass: 'toast-bottom-center',
            preventDuplicates: false,
            preventOpenDuplicates: true,
            progressBar: false,
            tapToDismiss: true,
            timeOut: 5000,
            titleClass: 'toast-title',
            toastClass: 'toast',
            allowHtml: true

        });

        angular.extend(ionicLoadingConfig, {
            content: 'Loading',
            templateUrl: 'html/views/modals/loader.html',
            animation: 'fade-in',
            showBackdrop: true,
            hideOnStateChange: false,
            maxWidth: 200,
            showDelay: 0
        });

        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.tabs.position('top');
       // $ionicConfigProvider.views.transition(ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() ? 'platform' : 'none');
            $ionicConfigProvider.views.transition('none');
        //$ionicConfigProvider.views.swipeBackEnabled(false);
        msdElasticConfig.append = '';
        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }

        if (window.cordova && window.cordova.plugins.Keyboard) {
            window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true); // Shows the Done button in the select of iOS
            window.cordova.plugins.Keyboard.disableScroll(true); // Scrolls the content to show the inputs properly
        }


        moment().calendar(null, {
            lastDay:'[Yesterday]',
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            nextWeek: 'ddd',
            sameElse: ''
        });

        moment.locale('en', {
            relativeTime : {
                s:  "%ds",
                m:  "1m",
                mm: "%dm",
                h:  "1h",
                hh: "%dh",
                d:  "1d",
                dd: "%dd",
                M:  "1 month",
                MM: "%d months",
                y:  "a year",
                yy: "%d years"
            }
        });



    }]);

}).call(this);