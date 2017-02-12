(function () {
    app.service('settingsService', function ($http, $rootScope, $state, $q, $window, API, RESPONSE_CODE, Upload,
                                             userModel, settingsModel, dbEnums, message, sync, connectivity,DEFAULTS) {

        var self = this;

        self.items = [
            {
                title: 'General',
                url: '/settings/general',
                icon:'tdzicon-tick'
            },
            {
                title: 'My Account',
                url: '/settings/account',
                icon:'tdzicon-task-visibility'
            },
            {
                title: 'Reminders',
                url: '/settings/reminder',
                icon: 'tdzicon-reminder'
            },
            {
                title: 'Notifications',
                url: '/settings/notifications',
                icon: 'tdzicon-notifications'
            },
            {
                title: 'About',
                url: '/settings/about',
                icon: 'tdzicon-logo'
            }
        ];

        self.defaultViews = [
            {
                title: 'Inbox',
                value: 'inbox'
            },{
                title: 'Today',
                value: 'today'
            },{
                title: 'Next 7 days',
                value: 'next7days'
            },{
                title: 'Overdue',
                value: 'overdue'
            },{
                title: 'Favourites',
                value: 'favourites'
            },{
                title: 'All Tasks',
                value: ''
            }];

        self.floatButtons = [
            {
                title: 'Add task',
                value: 0
            },{
                title: 'Show all',
                value: 1
            }];

        self.startDays = [
            {
                title: 'Saturday',
                value: 6
            },{
                title: 'Sunday',
                value: 0
            },{
                title: 'Monday',
                value: 1
            }];

        self.dateFormats = [
            {
                title: 'dd mmm yyyy',
                value: 0
            },{
                title: 'mmm dd yyyy',
                value: 1
            }];

        self.timeFormats = [
            {
                title: '12 hour',
                value: 0
            },{
                title: '24 hour',
                value: 1
            }];


        self.removeAvatar = function(data){
            var defer = $q.defer();

            if(connectivity.isConnected()){
                $http.post(API.settings.removeAvatar, data)
                    .success(function (results) {
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {

                            defer.resolve({
                                error:false,
                                msg: message.successMessages.PROFILE_IMAGE_UPDATED
                            });
                        } else if (results.response_code === RESPONSE_CODE.ERROR) {
                            defer.resolve({
                                error:true,
                                msg: message.errorMessages.GENERAL,
                                results: results
                            });
                        }

                    }).error(function (results) {
                        defer.resolve({
                            error:true,
                            msg: message.errorMessages.GENERAL,
                            results: results
                        });
                    });
            }
            else {
                defer.resolve({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }
            return defer.promise;
        };

        self.update = function(settings){
            var defer = $q.defer();

            sync.add(dbEnums.collections.Settings,
                {
                    settings: settings,
                    userId: userModel.getLoggedInId()
                }, dbEnums.events.Settings.update);
            settingsModel.addOrUpdate(settings, function(){
               defer.resolve();
            });
            return defer.promise;
        };

        self.updateEmail = function(data){

            var defer = $q.defer();
            if(connectivity.isConnected()){
                $http.post(API.settings.updateEmail, data)
                    .success(function (results) {
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {

                            defer.resolve({
                                error:false,
                                msg: message.successMessages.EMAIL_UPDATE_REQUEST
                            });
                        } else if (results.response_code === RESPONSE_CODE.ERROR) {

                            defer.resolve({
                                error:true,
                                msg: message.errorMessages[results.errors.value],
                                results: results
                            });
                        }

                    }).error(function (results) {
                        defer.resolve({
                            error:true,
                            msg: message.errorMessages.GENERAL,
                            results: results
                        });
                    });
            }
            else{
                defer.resolve({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }
            return defer.promise;
        };

        self.updateItem = function(item){
            settingsModel.addOrUpdate(item, function(){});
        };

        self.updatePassword = function(data){
            var defer = $q.defer();
            if(connectivity.isConnected()) {
                $http.post(API.settings.updatePassword, data)
                    .success(function (results) {
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {

                            defer.resolve({
                                error:false,
                                msg: message.successMessages.PASSWORD_UPDATED
                            });

                        } else if (results.response_code === RESPONSE_CODE.ERROR) {

                            defer.resolve({
                                error:true,
                                msg: message.errorMessages[results.errors.value],
                                results: results
                            });
                        }

                    }).error(function (results) {
                        defer.resolve({
                            error:true,
                            msg: message.errorMessages.GENERAL,
                            results: results
                        });
                    });
            }
            else {
                defer.resolve({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }

            return defer.promise;
        };

        self.updateUserName = function(data){
            var defer = $q.defer();

            if(connectivity.isConnected()){
                $http.post(API.settings.updateUserName, data)
                    .success(function (results) {
                        if (results.response_code === RESPONSE_CODE.SUCCESS) {

                            defer.resolve({
                                error:false,
                                msg: message.successMessages.NAME_UPDATED
                            });
                        } else if (results.response_code === RESPONSE_CODE.ERROR) {
                            defer.resolve({
                                error:true,
                                msg: message.errorMessages.GENERAL,
                                results: results
                            });
                        }

                    }).error(function (results) {
                        defer.resolve({
                            error:true,
                            msg: message.errorMessages.GENERAL,
                            results: results
                        });
                    });
            }
            else {
                defer.resolve({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }
            return defer.promise;
        };

        self.uploadAvatar = function(data){
            var defer = $q.defer();

            if(connectivity.isConnected()){
                Upload.upload({
                    url: API.settings.uploadAvatar,
                    fields: data,
                    file: data.file
                }).success(function (results) {
                    console.log(results);
                    if (results.response_code == RESPONSE_CODE.SUCCESS) {
                        defer.resolve({
                            error:false,
                            msg: message.successMessages.PROFILE_IMAGE_UPDATED
                        });
                    }
                    else if (results.response_code === RESPONSE_CODE.ERROR) {
                        defer.resolve({
                            error:true,
                            msg: message.errorMessages[results.errors.value],
                            results: results
                        });
                    }
                }).error(function () {
                    defer.resolve({
                        error:true,
                        msg: message.errorMessages.GENERAL,
                        results: results
                    });
                });
            }
            else {
                defer.resolve({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }
            return defer.promise;
        };

        self.updateSort=function(settings){
            var defer = $q.defer();

            sync.add(dbEnums.collections.Settings,
                {
                    sort: settings.sort,
                    userId: userModel.getLoggedInId()
                }, dbEnums.events.Settings.sortUpdate);
            settingsModel.addOrUpdate(settings, function(){
                defer.resolve();
            });
            return defer.promise;


        }

        self.getSettings = function(){

            var settings=JSON.parse($window.localStorage.getItem('settings'));
            if(settings && settings.reminder && (!settings.reminder.taskCreateReminderNotificationChannels || !settings.reminder.taskCreateReminderNotificationChannels.email.title)){
                settings.reminder.taskCreateReminderNotificationChannels=DEFAULTS.defaultSettings.taskCreateReminderNotificationChannels;
            }
            return settings;
        };

        self.deleteAccount=function(data){
            var defer=$q.defer();

            $http.post(
                API.settings.deleteAccount,
                data

            )
                .success(function(result){
                    defer.resolve(result);
                })
                .error(function(err){
                    defer.reject(err);
                })

            return defer.promise;
        };

        self.validateDeleteAccount=function(data) {
            var defer = $q.defer();

            $http.post(
                API.settings.checkForDelete,
                data
            )
            .success(function (result) {
                defer.resolve(result);
            })
            .error(function (err) {
                defer.reject(err);
            });

            return defer.promise;
        }



    });
}).call(this);
