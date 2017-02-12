var todoZuModules = [
    'angucomplete-alt',
    'angularMoment',
    'btford.socket-io',
    'ionic',
    'ionMdInput',
    'matchMedia',
    'monospaced.elastic',
    'ng-mfb',
    'ngAnimate',
    'ngCropper',
    'ngCordova',
    'ngFileUpload',
    'ngSanitize',
    'toastr',
    'ui.bootstrap.datetimepicker',
    'ui.router'
];

var app = angular.module('app', todoZuModules);

/*
* Important to developer
* Do not remove services from app dependencies as the services subscribe to certain events on first run.

 */
ionic.Platform.ready(function () {
    app.run(function ($rootScope, $state, $templateCache, $ionicSideMenuDelegate, $ionicScrollDelegate, $cordovaStatusbar,
                       screenSize, pushNotification, connectivity, sharedData, socket, orientation, TodoZuDB, userModel,taskService,$location,date,sortService,taskListView,platformService,user,loggingService,$ionicPopup,message,stringService,$window,gAnalytics,reminderService,popupService,$timeout) {

        /*
         * Important to developer
         * Do not remove services from app dependencies as the services subscribe to certain events on first run.

         */


        if(window.StatusBar) {
            StatusBar.overlaysWebView(true);
            StatusBar.styleDefault();
        }

        if($window.cordova && $window.TestFairy){
            console.log('initializing test fairy sdk');
            $window.TestFairy.begin('63c43cf0d18d04c9b9673e532c6075c842d8381a');
        }
        gAnalytics.init();

        //push notification
        if(connectivity.checkConnection()){
            try {

                pushNotification.init().then(function(){
                    pushNotification.getDeviceUniqueId()
                        .then(function(){

                           if($rootScope.isLoginProgress || !userModel.isAuthenticated()){

                               var successListener=$rootScope.$on('login-success',function(){
                                   successListener();
                                    registerDeviceInfo();

                               });
                           }
                            else{
                               registerDeviceInfo();
                           }

                        });
                });
            } catch (e) {
                console.log(e);
            }
        }

        function registerDeviceInfo(){
            user.registerDeviceInfo();
        }


        loggingService.init();

        $rootScope.isMobile=platformService.isMobileDevice();

        $ionicScrollDelegate.scrollTop();

        //create Database
        TodoZuDB.createDatabase();
        //monitor connectivity
        connectivity.startMonitor();

        //check device by screen size
        $rootScope.desktop = screenSize.is('md, lg');
        $rootScope.mobile = screenSize.is('xs, sm');


        //toast instance
        $rootScope.toastInstance = $templateCache.get('directives/toast/toast.html');
        //set orientation
        orientation.setOrientation();

        // Fix iOS keyboard bug
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.disableScroll(true);
        }


        if(userModel.isAuthenticated()){
            socket.connect();
            var pullEventListener=$rootScope.$on('pull-from-server-complete',function() {
                pullEventListener();
                $timeout(function(){
                    reminderService.cleanUpReminders();
                },1000);
            });
            $rootScope.$emit('push-to-server', true,true);
        }

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams) {

            $rootScope.loggedIn = userModel.isAuthenticated();
            if($ionicSideMenuDelegate.isOpen()) {
                $ionicSideMenuDelegate.toggleLeft();
            }

            var requireLogin = toState.requireLogin;
            var state =  toState.name;
            var params = toParams;

            //check if user is logged in
            if (userModel.isAuthenticated() && requireLogin == false) {
                    event.preventDefault();
                    sharedData.home();

            }
            else if(!userModel.isAuthenticated() && requireLogin == true) {
                    event.preventDefault();
                   $state.go('/login', {'returnUrl': toState.name, 'params': toParams.id}, {reload: true});
                    socket.disconnect();
                }
        });

        $rootScope.getActiveReminders=function(task){
            if(task===undefined){
                //debugger;
                return;
            }
            return taskService.getActiveReminders(task);
        };

        $rootScope.countActiveReminders=function(task){
            if(task===undefined){
                //debugger;
                return;
            }
            return taskService.countActiveReminders(task);
        };

        $rootScope.isReminderActive=function(task,reminder){
            if(reminder===undefined||task==undefined){
                //debugger;
                return;
            }
            return taskService.isReminderActive(task,reminder);
        };

        $rootScope.$on('$stateChangeSuccess',function(event,toState,toParams,fromState,fromParams){
            //console.log(arguments);
            $rootScope.currentPathHash='#'+$location.url();

        });

        //Handle browser back button

        //$rootScope.$on('$locationChangeSuccess', function() {
        //    $rootScope.actualLocation = $location.path();
        //});
        //
        //$rootScope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {
        //    if($rootScope.actualLocation === newLocation) {
        //
        //        console.log('--state--');
        //        console.log($state);
        //        //alert('Why did you use history back?');
        //        var currentState=$state.$current;
        //        var stateParams=$state.params;
        //        if(currentState && currentState.skipNavigation){
        //            var skipParamsLength= _.size(currentState.skipParams);
        //            if(skipParamsLength>0){
        //                var isMatch=navigationService.isMatchingParams(stateParams,currentState.skipParams);
        //                if(isMatch){
        //                    console.log('going back');
        //                    navigationService.goBack();
        //                }
        //            }
        //            else{
        //                console.log('going back');
        //                navigationService.goBack();
        //            }
        //        }
        //    }
        //});

        $rootScope.dateDisplayText=function(dt){
            if(!userModel.isAuthenticated())
                return;
            if(!dt){
                return "";
            }
            else{
                return date.getDateTime(new Date(dt));
            }
        }

        if(userModel.isAuthenticated()){
            //sortService.setAllSorts();
            //sortService.setAllOrders();
            //taskListView.setSelectedFilterView();

        }

        $rootScope.changeFilterView=function(filterKey,filterView){
            taskListView.setFilterView(filterKey,filterView);
            taskListView.setSelectedFilterView(filterKey);
        }



        $rootScope.$on('api-version-changed',function(e,newVersionStr){
            popupService.apiVersionChanged(function(){
                $window.localStorage.setItem('x-api-version',newVersionStr);
                user.logout();
            });
            //if(!apiVersionPopupShown){
            //    apiVersionPopupShown=true;
            //    $ionicPopup.alert({
            //        title: message.infoMessages.API_VERSION_CHANGE.title,
            //        content: message.infoMessages.API_VERSION_CHANGE.message,
            //        buttons: [{
            //            text: stringService.OK,
            //            onTap: function () {
            //                apiVersionPopupShown=false;
            //                $window.localStorage.setItem('x-api-version',newVersionStr);
            //                user.logout();
            //                //$rootScope.$emit('logout');
            //            }
            //        }]
            //    });
            //}


            //$window.alert(message.infoMessages.API_VERSION_CHANGE.message);
            //$rootScope.$emit('api-version-changed');
        });

//        if(!platformService.isMobileDevice()){
//            var appCache = window.applicationCache;
//
//            $(window).on('load',function(){
//                //alert('jquery ready called : 11:11');
//            });
//
//            //window.addEventListener('load', function(e) {
//            //    alert('this was changed at : 11:11');
//
//                window.applicationCache.addEventListener('updateready', function(e) {
//                    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
//                        // Browser downloaded a new app cache.
//                        //if (confirm('A new version of this site is available. Load it?')) {
//                        //    //window.location.reload();
//                        //}
//                    } else {
//                        // Manifest didn't changed. Nothing new to server.
//                    }
//                }, false);
//
//                function handleCacheEvent(e) {
//                    //...
//                    var msg= {
//                        title: 'Event type is : '+ e.type,
//                        message: 'Event type is : '+ e.type,
//                        success: true
//                    };
//
//                    console.log(msg.message);
//                    $rootScope.$emit('toast-message', msg);
//                }
//
//                function handleCacheError(e) {
//                    alert('Error: Cache failed to update!');
//                };
//
//// Fired after the first cache of the manifest.
//                appCache.addEventListener('cached', handleCacheEvent, false);
//
//// Checking for an update. Always the first event fired in the sequence.
//                appCache.addEventListener('checking', handleCacheEvent, false);
//
//// An update was found. The browser is fetching resources.
//                appCache.addEventListener('downloading', handleCacheEvent, false);
//
//// The manifest returns 404 or 410, the download failed,
//// or the manifest changed while the download was in progress.
//                appCache.addEventListener('error', handleCacheError, false);
//
//// Fired after the first download of the manifest.
//                appCache.addEventListener('noupdate', handleCacheEvent, false);
//
//// Fired if the manifest file returns a 404 or 410.
//// This results in the application cache being deleted.
//                appCache.addEventListener('obsolete', handleCacheEvent, false);
//
//// Fired for each resource listed in the manifest as it is being fetched.
//                appCache.addEventListener('progress', handleCacheEvent, false);
//
//// Fired when the manifest resources have been newly redownloaded.
//                appCache.addEventListener('updateready', handleCacheEvent, false);
//
//
//            //}, false);
//
//        }

    });

   // hide splashscreen for ios
   setTimeout(function() {
        if(window.cordova) navigator.splashscreen.hide();
    }, 1000);
    angular.bootstrap(document, [app.name]);




});
