(function () {
    app.controller('testSettingController', function ($rootScope, $scope, settingsService, $ionicModal) {


        $scope.start = function(){
            $scope.title = 'Test';


            $rootScope.$emit('basic:header', null, null, $scope, true, null, true);

        };
        $scope.start();

    });

}).call(this);
