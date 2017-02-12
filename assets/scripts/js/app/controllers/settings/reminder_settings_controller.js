(function () {
    app.controller('reminderSettingController', function ($rootScope, $scope, settingsService, $ionicModal, date,
                                                            $state, message, reminderService, discardChange,roleValidators,dbEnums,userModel,$q,DEFAULTS){

        $scope.isEmailEnabled=false;
        function setDropDowns(){
            $scope.dropdowns = {
                reminder: true
            }
        }

        function setSettings(){
            $scope.settings = settingsService.getSettings();
            discardChange.savePrevious($scope, $scope.settings);
        }

        function createModals(){

            $ionicModal.fromTemplateUrl('html/views/modals/settings/reminder/auto-reminder-notification-channels.html', function ($ionicModal) {
                $scope.autoReminderNotificationChannelsModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

            $ionicModal.fromTemplateUrl('html/views/modals/settings/reminder/auto-reminder-time.html', function ($ionicModal) {
                $scope.autoReminderTimeModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

            $ionicModal.fromTemplateUrl('html/views/modals/settings/reminder/others-reminder-notification-channels.html', function ($ionicModal) {
                $scope.othersReminderNotificationChannelsModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
            $ionicModal.fromTemplateUrl('html/views/modals/settings/reminder/task-create-reminder-notification-channels.html', function ($ionicModal) {
                $scope.taskCreateReminderNotificationChannelsModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

        }

        $scope.channelClicked = function (item) {

            var asyncTask=$q(function(resolve,reject){
               if(item.title=='Email' && item.value==false){
                   var user=userModel.getLoggedInUser();
                   roleValidators.checkUserRole(user,dbEnums.USER_ROLES.EMAIL_NOTIFICATIONS,{},true)
                       .then(resolve,reject);
               }
                else{
                   resolve();
               }
            });

            asyncTask.then(function(){
                item.value = !item.value;
                item.notified = !item.value;
            });



        };

        $scope.openAutoReminderNotificationChannelsModal = function(){

            $scope.notificationChannels = angular.copy($scope.settings.reminder.autoReminder.channels);
            if($scope.settings.reminder.autoReminder.enable) $scope.autoReminderNotificationChannelsModal.show();
        };

        $scope.openOthersReminderNotificationChannelsModal = function(){
            $scope.notificationChannels = angular.copy($scope.settings.reminder.othersReminderNotificationChannels);
            $scope.othersReminderNotificationChannelsModal.show();
        };

        $scope.openAutoReminderTimeModal = function(){
            if($scope.settings.reminder.autoReminder.enable) $scope.autoReminderTimeModal.show();
        };

        $scope.setAutoReminderNotificationChannels = function(){

            if( $scope.notificationChannels.email.value ||
                $scope.notificationChannels.push.value){

                $scope.settings.reminder.autoReminder.channels = angular.copy($scope.notificationChannels);
                $scope.notificationChannels = angular.copy(reminderService.notificationChannels);
                $scope.autoReminderNotificationChannelsModal.hide();
            }
        };

        $scope.setAutoReminderTime = function(time){

            $scope.settings.reminder.autoReminder.time = time;
        };

        $scope.setOthersReminderNotificationChannels = function(){

            if( $scope.notificationChannels.email.value ||
                $scope.notificationChannels.push.value){
                
                    $scope.settings.reminder.othersReminderNotificationChannels = angular.copy($scope.notificationChannels);
                    $scope.notificationChannels = angular.copy(reminderService.notificationChannels);
                    $scope.othersReminderNotificationChannelsModal.hide();
            }

        };

        $scope.openTaskCreateReminderNotificationChannelsModal=function(){
            $scope.notificationChannels = angular.copy($scope.settings.reminder.taskCreateReminderNotificationChannels ||DEFAULTS.defaultSettings.taskCreateReminderNotificationChannels);
            $scope.taskCreateReminderNotificationChannelsModal.show();

        };

        $scope.setTaskCreateReminderNotificationChannels = function(){

            if( $scope.notificationChannels.email.value ||
                $scope.notificationChannels.push.value){

                $scope.settings.reminder.taskCreateReminderNotificationChannels = angular.copy($scope.notificationChannels);
                $scope.notificationChannels = angular.copy(reminderService.notificationChannels);
                $scope.taskCreateReminderNotificationChannelsModal.hide();
            }

        };

        $scope.toggleDropdown = function(key){

            $scope.dropdowns[key] = !$scope.dropdowns[key];
        };

        $scope.save = function(){
            if(discardChange.isChanged($scope.settings)){
                settingsService.update($scope.settings).then(function(){
                    $rootScope.$emit('toast-message', message.successMessages.SETTINGS_SAVED);
                    discardChange.updateDiscardedBeforeSave();
                    $state.go('/settings');
                });
            }else{
                discardChange.updateDiscardedBeforeSave();
                $state.go('/settings');
            }

        };

        $scope.start = function(){
            $scope.title = 'Reminders';
            var user=userModel.getLoggedInUser();

            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.EMAIL_NOTIFICATIONS,{},false)
                .then(function(){
                    $scope.isEmailEnabled=true;
                });

            setDropDowns();
            createModals();
             setSettings();
            $scope.date = date;
            $scope.autoReminderTime = angular.copy(reminderService.timeDuration);
            $scope.notificationChannels = angular.copy(reminderService.notificationChannels);

            $rootScope.$emit('basic:header', null, null, $scope, true, null, true);


        };

        $scope.start();

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {

            discardChange.changeState(event, toState, toParams, $scope.settings);
        });

    });

}).call(this);
