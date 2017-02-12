/**
 * Created by skyestreamptyltd on 4/21/16.
 */
(function(){
    app.service('popupService',['$ionicPopup','$q','stringService','message','$rootScope','$ionicModal',function($ionicPopup,$q,stringService,message,$rootScope,$ionicModal){
        var self=this;
        self.discard=function(scope){
            var d=$q.defer();

            $ionicPopup.show({
                template: message.infoMessages.DISCARD_CHANGE.message,
                title: message.infoMessages.DISCARD_CHANGE.title,
                scope: scope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        d.resolve(false);
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            d.resolve(true);
                        }
                    }]
            });

            return d.promise;
        };


        self.roleWarning=function(scope,validationResult){
            var d=$q.defer();
            var childScope=scope?scope.$new():$rootScope.$new();
            var roleWarningPopup;
            childScope.cancel=function(){
                roleWarningPopup.remove();
                d.reject();
            }
            childScope.upgrade=function(){
                roleWarningPopup.remove();
                d.resolve();
            }
            childScope.validationResult=validationResult;
            $ionicModal.fromTemplateUrl('html/views/modals/validations/role_validation_popup.html', function ($ionicModal) {
                roleWarningPopup = $ionicModal;
                roleWarningPopup.show();
            }, {
                scope: childScope,
                animation: 'scale-in'
            });


            return d.promise;
        };

        var apiVersionPopupShown=false;
        self.apiVersionChanged=function(callback){
            if(!apiVersionPopupShown){
                apiVersionPopupShown=true;
                $ionicPopup.alert({
                    title: message.infoMessages.API_VERSION_CHANGE.title,
                    content: message.infoMessages.API_VERSION_CHANGE.message,
                    buttons: [{
                        text: stringService.OK,
                        onTap: function () {
                            apiVersionPopupShown=false;
                            if(callback){
                                callback();
                            }
                            //apiVersionPopupShown=false;
                            //$window.localStorage.setItem('x-api-version',newVersionStr);
                            //user.logout();
                            //$rootScope.$emit('logout');
                        }
                    }]
                });
            }
        }
    }]);
})();