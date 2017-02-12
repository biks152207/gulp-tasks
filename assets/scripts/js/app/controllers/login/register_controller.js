(function() {
    app.controller('registerController', function($scope,$rootScope, user, userModel, message,$stateParams) {
        

        $scope.showMessage = function(msg){
            $scope.alert = {
                title: msg.title,
                msg: msg.message,
                success: msg.success
            };
        };

        $scope.submit = function(form) {

            if(form.$valid){

                user.register($scope.user).then(function(results){
                    $scope.alert = {};
                    if(results.error){
                        $scope.showMessage(results.message);
                        form.$setPristine();
                        form.$setUntouched();
                        $scope.user = {};
                    }
                });

            }
        };

        $scope.start = function () {
            $scope.user = {};
            var requestLoginEmail = userModel.getRequestLoginEmail();
            if (requestLoginEmail) {
                $scope.user.email = requestLoginEmail;
                userModel.removeRequestLoginEmail();
            }
            $scope.alert = message.getAlert();
            message.clearAlert();
            if($stateParams.accountDeleted){
                $rootScope.$emit('toast-message',message.successMessages.ACCOUNT_DELETED);
            }
        };

        $scope.start();

        
  });	

}).call(this);
