(function() {
    app.controller('resetPasswordController', ["$scope", "user", "$stateParams", function($scope, user, $stateParams) {

        $scope.resetAlert = function() {
            $scope.alert = null;
        };

        $scope.showMessage = function(msg){
            $scope.alert = {
                title: msg.title,
                msg: msg.message,
                success: msg.success
            };
        };

        $scope.start = function(){
            $scope.credentials = {
                token: $stateParams.id
            };

        };

        $scope.submit = function(form) {
            if(form.$valid){

                user.resetPassword($scope.credentials).then(function(results){
                    $scope.resetAlert();
                    if(results.error){
                        $scope.showMessage(results.message);
                        form.$setPristine();
                        form.$setUntouched();
                        $scope.start();
                    }
                });

            }
        };

        $scope.start();


        $scope.resetpassword = function() {

            
            user.resetpassword($scope.resetpasswordform).then(function(data){
            	
            	$scope.submitted = false;
            	
                $scope.alertbox = true;
                $scope.alertTitle = data.title;
            	$scope.alertMsg = data.msg;
                $scope.success = data.status;
            	
                $scope.resetpasswordform.$setPristine();
              
            });
        };

        
  }]);	

}).call(this);
