(function () {
    app.service('user', ["$http", "$q", "$window", "$state", "$rootScope", "$ionicLoading", "API", "connectivity", "socket", "message", "RESPONSE_CODE", "sharedData", "notificationModel", "projectModel", "sync", "TodoZuDB", "labelModel", "filterModel", "taskModel", "settingsModel", "userModel", "sortService", "taskListView", function ($http, $q, $window, $state, $rootScope, $ionicLoading, API, connectivity, socket,
                                  message, RESPONSE_CODE, sharedData, notificationModel, projectModel, sync, TodoZuDB,
                                  labelModel, filterModel, taskModel, settingsModel, userModel, sortService,taskListView) {
        var self = this;

        self.register = function (data) {
            var defer = $q.defer();

            if(connectivity.isConnected()){
                $ionicLoading.show();
                $http.post(API.user.register, data)
                    .success(function (results) {
                        $ionicLoading.hide();
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {

                            userModel.setRequestLoginEmail(data.email);
                            message.setAlert(message.successMessages.CONFIRM_EMAIL_ADDRESS);
                            $state.go('/login');


                        }
                        else if (results.response_code === RESPONSE_CODE.ERROR) {
                            console.log(results);
                            defer.resolve({
                                error: true,
                                message: message.errorMessages[results.errors.value]
                            });
                        }

                    })
                    .error(function (results) {

                        $ionicLoading.hide();
                        defer.resolve({
                            error: true,
                            message: message.errorMessages.CONNECTION_ERROR
                        });
                    });
            }
            else{
                defer.resolve({
                    error: true,
                    message: message.errorMessages.CONNECTION_ERROR
                });
            }

            return defer.promise;
        };

        self.forgotPassword = function (data) {

            var defer = $q.defer();
            if(connectivity.isConnected()){
                $http.post(API.user.forgotPassword, data)
                    .success(function (results) {
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {

                            message.setAlert(message.successMessages.FORGOT_PASSWORD_EMAIL_SENT);
                            userModel.setRequestLoginEmail(results.data.email);
                            $state.go('/login');

                        } else if (results.response_code === RESPONSE_CODE.ERROR) {
                            console.log(results);
                            defer.resolve({
                                error: true,
                                message: message.errorMessages[results.errors[0].value]
                            });

                        }

                    }).error(function (results) {
                        defer.resolve({
                            error: true,
                            message: message.errorMessages.CONNECTION_ERROR
                        });
                    });
            }
            else{
                defer.resolve({
                    error: true,
                    message: message.errorMessages.CONNECTION_ERROR
                });
            }

            return defer.promise;
        };

        self.resetPassword = function (data) {

            var defer = $q.defer();
            if(connectivity.isConnected()){

                $http.post(API.user.resetPassword, data)
                    .success(function (results) {
                        console.log(results);
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {
                            self.clearAll();
                            message.setAlert(message.successMessages.RESET_PASSWORD_CONFIRMATION);
                            userModel.setRequestLoginEmail(results.data.email);
                            $state.go('/login');


                        } else if (results.response_code === RESPONSE_CODE.ERROR) {
                            defer.resolve({
                                error: true,
                                message: message.errorMessages[results.errors.value]
                            });

                        }

                    }).error(function (results) {
                        defer.resolve({
                            error: true,
                            message: message.errorMessages.CONNECTION_ERROR
                        });
                    });
            }
            else{
                defer.resolve({
                    error: true,
                    message: message.errorMessages.CONNECTION_ERROR
                });
            }

            return defer.promise;

        };

        self.login = function (data) {

            var defer = $q.defer();
            if(connectivity.isConnected()){



                $http.post(API.user.login, data)
                    .success(function (results) {
                        console.log('user login....')
                        console.log(results);
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {
                            detailsMapper(results.data).then(function(success){

                                sortService.setAll().then(function(){


                                    defer.resolve({
                                        success: success
                                    });
                                });

                            })

                        } else if (results.response_code === RESPONSE_CODE.ERROR) {

                            defer.resolve({
                                error: true,
                                message: message.errorMessages[results.errors.value]
                            });
                        }

                    })
                    .error(function () {

                        defer.resolve({
                            error: true,
                            message: message.errorMessages.CONNECTION_ERROR
                        });

                    });
            }
            else{
                defer.resolve({
                    error: true,
                    message: message.errorMessages.CONNECTION_ERROR
                });
            }


            return defer.promise;
        };

        self.logout = function (returnUrl, params) {

            $ionicLoading.show();
            if(userModel.getDeviceUniqueId()){
                var data = {
                    userId: userModel.getLoggedInId(),
                    uid: userModel.getDeviceUniqueId(),
                    device_token: userModel.getDeviceToken()
                };

                $http.post(API.user.logout, data)
                    .success(function (results) {

                        if (results.response_code === 200) {

                            self.clearAll();
                            $rootScope.$emit('logoff-success');
                            if(returnUrl && params)  $state.go('/login', {'returnUrl': returnUrl, 'params': params});
                            else $state.go('/login');
                            $ionicLoading.hide();


                        } else if (results.response_code === 500)  $rootScope.$emit('show-message', 'general','error');
                    }).error(function (results) {
                        //connection error
                        $ionicLoading.hide();
                    });
            }
            else {

                self.clearAll();
                $ionicLoading.hide();
                $rootScope.$emit('logoff-success');
                if(returnUrl && params)  $state.go('/login', {'returnUrl': returnUrl, 'params': params});
                else $state.go('/login');

                //$timeout(function(){
                //    //self.clearAll();
                //},200);
            }


        };

        self.clearAll = function () {

            taskListView.clearFilterView();
            socket.disconnect();
            userModel.clearSession();
            TodoZuDB.dropDatabase();

        };

        function detailsMapper(data) {

            var defer = $q.defer();

            $window.localStorage.setItem('timestamp', new Date());

            TodoZuDB.createInstances().then(function(){
                userModel.addOrUpdate(data.userInfo, function(){});
                if(data.taskCustomOrders){
                    userModel.setTaskCustomOrders(data.taskCustomOrders);
                }
                userModel.setToken(data.token, function(){});
                settingsModel.addOrUpdate(data.settings, function(){});
                if(data.settings.filterView){
                    settingsModel.setAllFilterViews(data.settings.filterView);

                }
                if(data.settings.sortOption){
                    settingsModel.setAllSortOptions(data.settings.sortOption);
                }
                if(data.features) userModel.saveUserFeatures(data.features);

                if(data.licenseFeatures) userModel.saveAllFeatures(data.licenseFeatures);


                projectModel.bulkUpdate(data.projects, function(){});
                labelModel.bulkUpdate(data.labels, function(){});
                filterModel.bulkUpdate(data.filters, function(){

                    //sortService.setDefault(data.settings.default_view.value,data.settings.sort);
                });

                taskModel.bulkUpdate(data.tasks, function(){});
                notificationModel.bulkUpdate(data.notifications, function(){});

                if(data.api_version){
                    $window.localStorage.setItem('x-api-version',data.api_version);
                }

                defer.resolve(true);
                //Connect socket;
                //socket.connect();
            });
            return defer.promise;
        }

        self.validatePassword=function(password,callback){
            var defer=$q.defer();
            data={
                password:password,
                userId:userModel.getLoggedInId()
            };

            $http.post(API.user.validatePassword, data)
                .success(function (results) {

                    if (results.response_code === 200) {

                        defer.resolve(results.data.result);

                    }
                    else {
                        defer.resolve(false);
                    }
                }).error(function (results) {
                    //connection error
                    defer.reject(results);
                });


            return defer.promise;
        }

        self.registerDeviceInfo=function() {
            var defer = $q.defer();
            var credentials = {
                userId:userModel.getLoggedInId()
            };
            credentials.deviceInfo = {
                uid: userModel.getDeviceUniqueId(),
                device_type: ionic.Platform.platform(),
                device_token: userModel.getDeviceToken()
            };

            $http.post(API.user.registerDeviceInfo, credentials)
                .then(function (results) {
                    defer.resolve();
                },function(err){
                    defer.reject(err);
                });

            return defer.promise;
        }



        self.logoutListener = $rootScope.$on('logout', function( event, returnUrl, params){

                self.logout(returnUrl, params);
        });


    }]);


}).call(this);