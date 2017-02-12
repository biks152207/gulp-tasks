(function () {
    app.controller('notificationsSettingController', ["$rootScope", "$scope", "$state", "settingsService", "message", "discardChange", "userModel", "dbEnums", "roleValidators", function ($rootScope, $scope, $state, settingsService, message, discardChange,userModel,dbEnums,roleValidators) {

        $scope.emailChangeDisabled=true;
        function setDropDowns(){
            $scope.dropdowns = {
                tasks: true,
                projects: true
            }
        }

        function setSettings(){
            $scope.settings = settingsService.getSettings();
            discardChange.savePrevious($scope, $scope.settings);
        }
        
        $scope.toggleDropdown = function(key){

            $scope.dropdowns[key] = !$scope.dropdowns[key];
        };

        $scope.save = function (){
            if(discardChange.isChanged($scope.settings)){
                settingsService.update($scope.settings).then(function(){
                    $rootScope.$emit('toast-message', message.successMessages.SETTINGS_SAVED);
                    discardChange.updateDiscardedBeforeSave();
                    $state.go('/settings');
                });
            }
            else{
                discardChange.updateDiscardedBeforeSave();
                $state.go('/settings');
            }

        };
        
        $scope.start = function(){
            var user=userModel.getLoggedInUser();
            $scope.title = 'Notifications';
            setSettings();
            setDropDowns();
            $rootScope.$emit('basic:header', null, null, $scope, true, null, true);

            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.EMAIL_NOTIFICATIONS,{},false)
                .then(function(){
                    $scope.emailChangeDisabled=false;
                },function(err){
                    if(err.key=='LICENSE'){
                        //_.each($scope.settings.notifications,function(notiVal,notiKey){
                        //    notiVal['email']=false;
                        //});
                        //
                        //setSettings($scope.settings);

                    }
                });



        };

        $scope.start();

        var settingsListener = $rootScope.$on('settings-update', function(){
            setSettings();
        });

        $scope.$on('$destroy',settingsListener);

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {
            discardChange.changeState(event, toState, toParams, $scope.settings);
        });

        $scope.emailClick=function(event){
            if($scope.emailChangeDisabled){
                var user=userModel.getLoggedInUser();
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.EMAIL_NOTIFICATIONS,{},true);

            }
        };

        

    }]);

}).call(this);
