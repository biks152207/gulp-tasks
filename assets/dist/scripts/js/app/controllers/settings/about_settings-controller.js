(function () {
    app.controller('aboutSettingController', ["$rootScope", "$scope", "$state", "$window", "CONSTANT", function ($rootScope, $scope, $state, $window, CONSTANT) {
        
        $scope.redirectTo = function(url){
            $state.transitionTo(url);
        };

        $scope.openWebsite = function(){
            $window.open($scope.websiteURL,'_blank');
        };

        $scope.start = function(){
            $scope.title = 'About';
            $scope.websiteURL = CONSTANT.website;
            $scope.version = CONSTANT.version;
            var platform=ionic.Platform.platform();

            $scope.currentPlatform =platform=='ios'?'iOS': _.capitalize(ionic.Platform.platform());
            $scope.currentPlatformVersion = ionic.Platform.version();

            $rootScope.$emit('basic:header', null, null, $scope, false, null, true);
        };

        $scope.start();


    }]);

}).call(this);
