(function() {
    app.directive('tdzAvatar', function() {
        var definition;
        definition = {
            restrict: 'E',
            templateUrl: 'html/directives/shared/avatar.html',
            scope: {
                imageSrc: '@',
                shortName: '@',
                position: '@'
            },
            replace: true,
            link: function($scope, element, attrs) {

                $scope.url =  $scope.imageSrc ;
                $scope.name = $scope.shortName;
                if($scope.position == "right"){
                    $scope.itemPosition = "avatar-right";
                }
                else $scope.itemPosition = "avatar-left";


            }
        };
        return definition;
    });

}).call(this);