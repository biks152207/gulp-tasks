(function () {
    app.directive('tdzTimepicker', ['$timeout', '$ionicModal', function ($timeout, $ionicModal) {
        return {
            require: 'ngModel',
            scope: {
                'ngModel': '=',
                canClearDate: '@',
                'callback': '&'
            },

            link: function ($scope, $element, attrs) {

                function setTimePicker() {
                    $scope.picker = {
                        time: $scope.ngModel ? new Date($scope.ngModel) : new Date()
                    };
                }

                $element.on('click', function () {
                    
                    setTimePicker();
                    $ionicModal.fromTemplateUrl('html/directives/shared/timepicker.html', function ($ionicModal) {
                        $scope.modal = $ionicModal;
                        $scope.modal.show();
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });
                });

                $scope.save = function () {

                    $scope.ngModel = new Date($scope.picker.time);

                    $timeout(function () {
                        $scope.modal.remove();
                        $scope.callback({newTime: true});
                    });
                };

                $scope.close = function () {
                    $scope.modal.remove();
                    $scope.callback({newTime: false});
                };

            }
        };
    }]);
}).call(this);
