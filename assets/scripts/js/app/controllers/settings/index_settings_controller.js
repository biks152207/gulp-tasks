(function () {
    app.controller('indexSettingController', function ($rootScope, $scope, $state, settingsService) {

        
        $scope.redirectTo = function(url){
            $state.transitionTo(url);
        };

        $scope.start = function(){

            $scope.title = 'Settings';
            $scope.list = settingsService.items;
            $rootScope.$emit('basic:header', null, null, $scope, false, null, true);
        };

        $scope.start();


    });

}).call(this);
