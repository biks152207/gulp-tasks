(function () {
    app.controller('accountSettingController', function ($rootScope, $scope, $state, $ionicModal, user,
                                                                                            settingsService, stringService, message, userModel,dbEnums,connectivity,$ionicLoading) {

        function setUserProfile(){

            $scope.userProfile= {
                name: userModel.getLoggedInName(),
                email: userModel.getLoggedInEmail(),
                displayShortName: userModel.getLoggedInShortName(),
                avatar: userModel.getAvatar()
            }
        }

        function setDropDowns(){
            $scope.dropdowns = {
                profile: true,
                account: true
            }
        }

        //user name update
        $scope.openUserNameModal = function(){

            $scope.userNameModel = {
                firstName: userModel.getLoggedInFirstName(),
                lastName: userModel.getLoggedInLastName()
            };
            $ionicModal.fromTemplateUrl('html/views/modals/settings/account/user_name_update.html', function ($ionicModal) {
                $scope.userNameModal = $ionicModal;
                $scope.userNameModal.show();
            }, {
                scope: $scope,
                animation: 'scale-in'
            });


        };

        $scope.closeUserNameModal = function(event){
            event.preventDefault();
            $scope.userNameModal.remove();
        };

        $scope.updateUserName = function(){
            $scope.userNameModal.remove();
            settingsService.updateUserName($scope.userNameModel).then(function(results){
                    $rootScope.$emit('toast-message', results.msg);
            });
        };

        //user email update
        $scope.openUserEmailModal = function(){

            $scope.userEmailModel = {
                email: userModel.getLoggedInEmail(),
                password: stringService.EMPTY
            };
            $ionicModal.fromTemplateUrl('html/views/modals/settings/account/user_email_update.html', function ($ionicModal) {
                $scope.userEmailModal = $ionicModal;
                $scope.userEmailModal.show();
            }, {
                scope: $scope,
                animation: 'scale-in'
            });


        };

        $scope.closeUserEmailModal = function(event){
            event.preventDefault();
            $scope.userEmailModal.remove();
        };

        $scope.updateUserEmail = function(){
            $scope.userEmailModal.remove();
            settingsService.updateEmail($scope.userEmailModel).then(function(results){
                $rootScope.$emit('toast-message', results.msg);
            });
        };

        //user password update
        $scope.openUserPasswordModal = function(){

            $scope.userPasswordModel = {};

            $ionicModal.fromTemplateUrl('html/views/modals/settings/account/user_password_update.html', function ($ionicModal) {
                $scope.userPasswordModal = $ionicModal;
                $scope.userPasswordModal.show();

            }, {
                scope: $scope,
                animation: 'scale-in'
            });


        };

        $scope.closeUserPasswordModal = function(event){
            event.preventDefault();
            $scope.userPasswordModal.remove();
        };

        $scope.updateUserPassword = function(){
            $scope.userPasswordModal.remove();
            settingsService.updatePassword($scope.userPasswordModel).then(function(results){
                if(!results.error){
                    userModel.setRequestLoginEmail(userModel.getLoggedInEmail());
                    user.clearAll();
                    $state.go('/login');
                }
                $rootScope.$emit('toast-message', results.msg);
            });
        };


        $scope.redirectTo = function(url){
            $state.transitionTo(url);
        };

        $scope.toggleDropdown = function(key){

            $scope.dropdowns[key] = !$scope.dropdowns[key];
        };

        $scope.logout = function(){
           user.logout();
        };

        $scope.start = function(){

            $scope.title = 'My Account';
            setDropDowns();
            setUserProfile();
            //only for iOS.Because iOS Keyboard hides the input in the popup
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.disableScroll(false);
            }
            $rootScope.$emit('basic:header', null, null, $scope, false, null, true);
        };

        $scope.start();

        var userUpdateListener = $rootScope.$on('userInfo-update', function(){
            setUserProfile();
            $state.reload();
        });

        var deleteAccountConfirm=function(){
            $ionicModal.fromTemplateUrl('html/views/modals/settings/account/account_delete_warning.html', function ($ionicModal) {
                $scope.accountDeleteWarning = $ionicModal;
                $scope.accountDeleteWarning.show();

            }, {
                scope: $scope,
                animation: 'scale-in'
            });
        }

        $scope.closeDeleteAccountModal=function(e){
            e.preventDefault();
            $scope.accountDeleteWarning.remove();
        }

        $scope.deleteAccountValidate=function(e){
            e.preventDefault();
            $scope.accountDeleteWarning.remove();
            $scope.accountDeleteValidateModel={deleteText:"",password:'',DELETE_VALIDATION_REGEX:dbEnums.keys.DELETE_VALIDATION_REGEX};
            $scope.accountDeleteValidateModel.$error={};
            $ionicModal.fromTemplateUrl('html/views/modals/settings/account/account_delete_validate_form.html', function ($ionicModal) {
                $scope.accountDeleteValidateForm = $ionicModal;

                $scope.accountDeleteValidateForm.show();

            }, {
                scope: $scope,
                animation: 'scale-in'
            });

        }

        $scope.closeDeleteAccountValidateModal=function(e){
            e.preventDefault();
            $scope.accountDeleteValidateForm.remove();
        }

        $scope.checkValidDeleteAccount=function(e){
            e.preventDefault();
            //alert('Going for api call');
            if(connectivity.isConnected()){
                var data={};
                data.userId = userModel.getLoggedInId();
                $ionicLoading.show();
                settingsService.validateDeleteAccount(data)
                    .then(function(responseObj){
                        $ionicLoading.hide();
                        console.log('---- result from validate deleting account---');
                        var data=responseObj?responseObj.data.response:undefined;
                        console.log(data);
                        if(!data.result){
                            handleFailure(data);
                        }
                        else{
                            //$scope.accountDeleteValidateForm.remove();
                            deleteAccountConfirm();
                        }
                        //if(result.result)
                    },function(err){
                        $ionicLoading.hide();
                        console.log('----error while deleting account-----');
                        console.log(err);
                    })
                ;
            }
            else{
                $rootScope.$emit('toast-message',message.errorMessages.CONNECTION_REQUIRED);
            }
        }

        $scope.deleteAccount=function(e){
            e.preventDefault();
            //alert('Going for api call');
            if(connectivity.isConnected()){
                var data=$scope.accountDeleteValidateModel;
                data.userId = userModel.getLoggedInId();
                $ionicLoading.show();
                settingsService.deleteAccount(data)
                    .then(function(responseObj){
                        $ionicLoading.hide();
                        console.log('---- result from deleting account---');
                        var data=responseObj?responseObj.data.response:undefined;
                        console.log(data);
                        if(!data.result){
                            handleFailure(data);
                        }
                        else{
                            $scope.accountDeleteValidateForm.remove();
                            user.clearAll();
                            $state.go('/register',{accountDeleted:true,reload:true,notify:false});
                        }
                        //if(result.result)
                    },function(err){
                        $ionicLoading.hide();
                        console.log('----error while deleting account-----');
                        console.log(err);
                    })
                    .finally(function(){
                        //$ionicLoading.hide();
                    })
                ;
            }
            else{
                $rootScope.$emit('toast-message',message.errorMessages.CONNECTION_REQUIRED);
            }
        };

        function openDeleteFailureModal(){
            $ionicModal.fromTemplateUrl('html/views/modals/settings/account/account_delete_failure.html',function(ionicModal){
               $scope.accountDeleteFailureModal=ionicModal;
                $scope.accountDeleteFailureModal.show();
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

        };

        function handleFailure(data){
            var isPassword=false;
            $scope.accountDeleteValidateModel=$scope.accountDeleteValidateModel||{};
            $scope.accountDeleteValidateModel.$error={};
            _.each(data.reasons,function(reason){
                $scope.accountDeleteValidateModel.$error[reason.key]=reason.value;
                if(reason.key=='password'){
                    isPassword=true;
                }
            });

            if(!isPassword){
                //$scope.accountDeleteValidateForm.remove();
                $scope.accountDeleteFailureReasons=data.reasons;
                openDeleteFailureModal();
            }

        }

        $scope.$on('$stateChangeStart', function(){
            //only for iOS.Because iOS Keyboard hides the input in the popup
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.disableScroll(true);
            }
        });

        $scope.$on('$destroy', userUpdateListener);


    });

}).call(this);
