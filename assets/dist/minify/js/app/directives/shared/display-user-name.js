(function () {
    app.directive('displayUserName', [ 'userModel', function (userModel) {
        return {
            restrict: 'E',
            replace: true,
            scope:{
                user: '='
            },
            transclude:true,
            template: '<span>{{name}} <ng-transclude></ng-transclude> </span>',
            link: function ($scope, $element, $attributes) {
                var loginId = userModel.getLoggedInId();

                $scope.$watch('user', function(){
                    $scope.name = $scope.user._id == loginId ? "Me " : $scope.user.displayName+" ";
                });

            }
        };
    } ]);
}).call(this);
