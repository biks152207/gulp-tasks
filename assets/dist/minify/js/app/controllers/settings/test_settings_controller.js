(function () {
    app.controller('testSettingController', ["$rootScope", "$scope", "settingsService", "$ionicModal", function ($rootScope, $scope, settingsService, $ionicModal) {


        $scope.start = function(){
            $scope.title = 'Test';


            $rootScope.$emit('basic:header', null, null, $scope, true, null, true);

        };
        $scope.start();

    }]);

}).call(this);
