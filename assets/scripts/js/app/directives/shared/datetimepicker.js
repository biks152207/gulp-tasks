(function () {
    app.directive('tdzDatetimepicker', ['$timeout', '$ionicModal', function ($timeout, $ionicModal) {
        return {
            require: 'ngModel',
            scope: {
                'ngModel': '=',
                canClearDate: '@',
                'callback': '&'
            },

            link: function ($scope, $element, attrs) {

                $scope.currentTab = 'date';

                var timeChangeListener,dateChangeListener;
                var dateChanged=false,timeChanged=false;
                function setDatetimePicker() {
                    dateChanged=false,timeChanged=false;
                    var tm=$scope.ngModel ? new Date($scope.ngModel) : new Date().setHours(0, 0, 0, 0);
                    $scope.datepicker = {
                        date: $scope.ngModel ? new Date($scope.ngModel) : null,
                        time: new Date(tm)

                    };
                    dateChangeListener=$scope.$watch('datepicker.date',function(newVal,oldVal){
                       if(newVal==oldVal){
                           return;
                       }
                        dateChanged=true;
                        console.log('date changed to : '+newVal);

                    });
                    timeChangeListener=$scope.$watch('datepicker.time',function(newVal,oldVal){
                        if(newVal==oldVal){
                            return;
                        }
                        timeChanged=true;
                        console.log('time changed to : '+newVal);

                    });
                }

                $element.on('click', function () {

                    setDatetimePicker();
                    $ionicModal.fromTemplateUrl('html/directives/shared/datetimepicker.html', function ($ionicModal) {
                        $scope.modal = $ionicModal;
                        $scope.modal.show();
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });
                });

                $scope.discardDate = function () {
                    $scope.datepicker.date = undefined;
                };

                $scope.discardTime = function () {
                    $scope.datepicker.time = new Date($scope.datepicker.time.setHours(0, 0, 0, 0));
                };

                $scope.save = function () {
                    if ($scope.datepicker.date === undefined && !timeChanged) $scope.ngModel = undefined;
                    else {
                        if($scope.datepicker.date===null && timeChanged){
                            $scope.datepicker.date = new Date();
                        }
                        $scope.datepicker.time = new Date($scope.datepicker.time);
                        $scope.datepicker.date = new Date($scope.datepicker.date);

                        $scope.ngModel = new Date($scope.datepicker.date.getFullYear(), $scope.datepicker.date.getMonth(), $scope.datepicker.date.getDate(), $scope.datepicker.time.getHours(), $scope.datepicker.time.getMinutes());

                    }

                    clearListeners();
                    $timeout(function () {
                        $scope.modal.remove();
                        $scope.callback({value:dateChanged || timeChanged ||$scope.datepicker.date===undefined? 'CUSTOM_DATE':'NO_DATE',fieldsChanged:{date:dateChanged,time:timeChanged}});
                    });
                };

                $scope.close = function () {
                    clearListeners();
                    $timeout(function () {
                        $scope.modal.remove();
                        $scope.callback({value: 'NO_DATE',fieldsChanged:{date:false,time:false}});
                    });

                };

                function clearListeners(){
                    if(dateChangeListener) dateChangeListener();
                    if(timeChangeListener) timeChangeListener();
                }

            }
        };
    }]);
}).call(this);
