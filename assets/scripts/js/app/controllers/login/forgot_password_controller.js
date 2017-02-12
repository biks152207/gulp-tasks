(function() {
    app.controller('forgotPasswordController', function($scope, user) {

        $scope.change = function() {
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
            $scope.credentials = {};
        };

        $scope.submit = function(form) {
            if(form.$valid){

                user.forgotPassword($scope.credentials).then(function(results){
                    $scope.alert = null;
                    if(results.error){
                        $scope.showMessage(results.message);
                        form.$setPristine();
                        form.$setUntouched();
                        $scope.credentials = {};
                    }
                });

            }
        };

        $scope.start();

        
  });	

}).call(this);
