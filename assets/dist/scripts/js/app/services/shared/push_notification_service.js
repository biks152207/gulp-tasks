(function () {
    app.service('pushNotification', ["$rootScope", "$state", "$q", "$window", "platformService", "userModel", "PUSH_NOTIFICATION_CONFIG", "$timeout", "toastr", "$ionicLoading", "$ionicPopup", "stringService", function ($rootScope, $state, $q, $window, platformService, userModel, PUSH_NOTIFICATION_CONFIG, $timeout, toastr,$ionicLoading,$ionicPopup,stringService) {

        var self = this;
        var pushNotification;

        self.initialized=false;
        //$window.myerrors=[];

        function notificationOpenedCallback(jsonData) {

            //alert(JSON.stringify(jsonData));
            //alert(jsonData.message);
            //$window.myerrors=[];
            //$window.myerrors.push('jsonData is - '+JSON.stringify(jsonData));

            console.log(jsonData);

            var data =  jsonData.additionalData;
           if(jsonData.isActive){


               $ionicPopup.alert({
                   title: data.title,
                   content: jsonData.message,
                   buttons: [{
                       text: stringService.CLOSE,
                       onTap: function () {
                           openNotification(data,jsonData.isActive);
                       }
                   }]
               });
           }
            else{

                       openNotification(data,jsonData.isActive);

           }



        }

        function notificationOpenedWebCallback(jsonData){
            console.log(jsonData);
            var data=jsonData.data;

            openNotification(data,jsonData.isActive);
        }

        function openNotification(data,isActive){

            console.log('push notification data');
            console.log(data);
            //$window.myerrors.push('going for pull');
            var pullEventListener=$rootScope.$on('pull-from-server-complete',function(){
                pullEventListener();
                $timeout(function(){
                    if(!isActive) {

                        //$window.myerrors.push('hiding loading');
                        $ionicLoading.hide();

                    }
                    //$window.myerrors.push('data is - '+JSON.stringify(data));
                    //$window.myerrors.push('isActive is : '+isActive);

                    if(!isActive){

                        $state.go(data.state,data.params);
                    }
                    else{
                        //alert('isActive');
                        //console.log('isActive');
                    }
                },300);




            });

            $rootScope.$emit('pull-from-server');
            if(!isActive){
                $ionicLoading.show();
            }


            //$timeout(function(){
            //
            //},300);



        }

        function requestDesktopLocalNotificationPermission(){
            if (notify.PERMISSION_DEFAULT == notify.permissionLevel() || notify.PERMISSION_DENIED == notify.permissionLevel()) {
                notify.requestPermission(function() {
                });
            }
        }

        self.init = function () {
            var defer = $q.defer();

            if(platformService.isMobileDevice()){
                pushNotification = window.plugins.OneSignal;
                pushNotification.init(PUSH_NOTIFICATION_CONFIG.APP_ID,
                    {
                        googleProjectNumber: PUSH_NOTIFICATION_CONFIG.GOOGLE_PROJECT_NUMBER
                    },
                    notificationOpenedCallback);

                //pushNotification.enableInAppAlertNotification(true);
                self.initialized=true;
                defer.resolve();
            }
            else{
                pushNotification = window.OneSignal || [];
                var initConfig={
                    appId: PUSH_NOTIFICATION_CONFIG.APP_ID//,
                    //subdomainName: PUSH_NOTIFICATION_CONFIG.SUB_DOMAIN_NAME
                    ,notificationClickHandlerMatch: 'origin'
                };
                if(location.protocol.indexOf('https')<0){
                    initConfig['subdomainName']=PUSH_NOTIFICATION_CONFIG.SUB_DOMAIN_NAME;
                }
                pushNotification.push(["init", initConfig]);

                pushNotification.push(['addListenerForNotificationOpened', notificationOpenedWebCallback]);

                pushNotification.push(["isPushNotificationsEnabled", function(enabled) {
                    if(!enabled){
                        pushNotification.push(["registerForPushNotifications"]);
                    }

                }]);

                //permission for local web notification
                requestDesktopLocalNotificationPermission();
                self.initialized=true;
                defer.resolve();
                //pushNotification.push(function() {
                //    // Occurs when the user's subscription changes to a new value.
                //    pushNotification.on('subscriptionChange', function (isSubscribed) {
                //        console.log("The user's subscription state is now:", isSubscribed);
                //    });
                //});
            }
            return defer.promise;
        };

        self.getDeviceUniqueId = function() {
                var defer = $q.defer();
                console.log(new Date());
                if(pushNotification){
                    if(platformService.isMobileDevice()){
                        pushNotification.getIds(function(ids) {
                            //toastr.success(ids.pushToken);

                            console.log("getIdsAvailable:"
                                + "\nUserID: " + ids.userId
                                + "\nRegistration ID: " + ids.pushToken);
                            console.log(new Date());


                            userModel.setDeviceUniqueId(ids.userId);
                            userModel.setDeviceToken(ids.pushToken);
                            defer.resolve({
                                userId: ids.userId,
                                device_token: ids.pushToken
                            });


                        });
                    }
                    else{
                        pushNotification.push(["getIdsAvailable", function(info) {
                            console.log("getIdsAvailable:"
                                + "\nUserID: " + info.userId
                                + "\nRegistration ID: " + info.registrationId);
                            console.log(new Date());

                            userModel.setDeviceUniqueId(info.userId);
                            userModel.setDeviceToken(info.registrationId);
                            defer.resolve({
                                userId: info.userId,
                                device_token: info.registrationId
                            });
                        }]);

                    }

                }
                return defer.promise;
        };

    }]);
}).call(this);
