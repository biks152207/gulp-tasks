(function() {
    app.directive('favouriteButton', function() {
        var directiveDefinition;
        directiveDefinition = {
            restrict: 'AE',
            replace: true,
            templateUrl: 'html/directives/shared/favourite_button_directive.html',
            scope: {
                favourited: '@'
            },
            controller: function($scope) {
                var buttonClicked;
                buttonClicked = function() {
                    return $scope.favourited = !$scope.favourited;
                };
                $scope.buttonClicked = buttonClicked;
            }
        };
        return directiveDefinition;
    });

}).call(this);
