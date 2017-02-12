(function () {
    app.directive('tdzRecurrencepicker', ['$timeout', '$ionicModal', 'settingsService', 'date', 'dueService',function ($timeout, $ionicModal, settingsService, date, dueService) {
        return {
            require: 'ngModel',
            scope: {
                ngModel: '=',
                callback: '&'
            },
            link: function ($scope, $element, attrs) {


                function setRecurrencePicker() {
                    $scope.recurrencePicker = {
                        isRecurring: true,
                        repeat: $scope.ngModel.repeat || dueService.REPEAT_KEY.DAILY ,
                        every: $scope.ngModel.every || 1,
                        starts_on: $scope.ngModel.starts_on || new Date (),
                        repeatBy: $scope.ngModel.repeatBy || 0,
                        repeatOn: getRepeatOnItems(),
                        repeatEnd: $scope.ngModel.repeatEnd || {
                            id: 0,
                            end: null,
                            occurrence: null,
                            remainingOccurrence: null
                        }

                    };

                    $scope.repeats =  dueService.REPEAT_ITEMS;

                    $scope.repeatByList =  dueService.REPEAT_BY_ITEMS;
                    $scope.repeatByList[$scope.recurrencePicker.repeatBy].checked =  true;

                    $scope.start_on_display = date.getDateTime($scope.recurrencePicker.starts_on);

                    $scope.updateSummary();

                }


                function getRepeatOnItems(){

                    var length = settingsService.getSettings().start_day.value;
                    //var repeatOnList =$scope.ngModel.repeatOn || dueService.REPEAT_ON_ITEMS;
                    var repeatOnList = angular.copy(dueService.REPEAT_ON_ITEMS);
                    if($scope.ngModel.repeatOn){
                        _.each(repeatOnList,function(rpt){
                           var existingRpt= _.find($scope.ngModel.repeatOn ||[],function(extRpt){
                               return extRpt.title==rpt.title;
                           });

                            if(existingRpt){
                                rpt.checked=existingRpt.checked;
                            }

                        });
                    }
                    
                    var tempList = angular.copy(repeatOnList);

                    for(var i=0;i<length; i++) {
                        repeatOnList.push(tempList[i]);

                    }
                    repeatOnList.splice(0,length);
                    return repeatOnList;
                }
                function createModals(){

                    $ionicModal.fromTemplateUrl('html/directives/shared/repeat.html', function ($ionicModal) {
                        $scope.repeatModal = $ionicModal;
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });

                    $ionicModal.fromTemplateUrl('html/directives/shared/repeat_every.html', function ($ionicModal) {
                        $scope.repeatEveryModal = $ionicModal;
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });

                    $ionicModal.fromTemplateUrl('html/directives/shared/recurrence_picker.html', function ($ionicModal) {
                        $scope.modal = $ionicModal;
                        $scope.modal.show();
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });
                }

                function removeModals(){
                    $scope.repeatEveryModal.remove();
                    $scope.repeatModal.remove();
                    $scope.modal.remove();
                }


                $element.on("click", function () {
                    //only for iOS.Because iOS Keyboard hides the input in the popup
                    if (window.cordova && window.cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.disableScroll(false);
                    }
                    setRecurrencePicker();
                    createModals();
                });

                $scope.save = function () {

                    var recurrence = {
                        isRecurring: true,
                        repeat:  $scope.recurrencePicker.repeat,
                        every: $scope.recurrencePicker.every,
                        starts_on: $scope.recurrencePicker.starts_on || new Date (),
                        repeatEnd: $scope.recurrencePicker.repeatEnd
                    };

                    if( $scope.recurrencePicker.repeat === dueService.REPEAT_KEY.WEEKLY){
                        recurrence.repeatOn = $scope.recurrencePicker.repeatOn;
                    }
                    if( $scope.recurrencePicker.repeat === dueService.REPEAT_KEY.MONTHLY){
                        recurrence.repeatBy = $scope.recurrencePicker.repeatBy;
                        recurrence.weekNumber = $scope.recurrencePicker.weekNumber;
                    }

                    $scope.ngModel = angular.copy(recurrence);
                    removeModals();
                    $timeout(function () {

                        //only for iOS.Because iOS Keyboard hides the input in the popup
                        if (window.cordova && window.cordova.plugins.Keyboard) {
                            cordova.plugins.Keyboard.disableScroll(true);
                        }
                        $scope.callback({model: $scope.ngModel});
                    });

                };

                $scope.close = function () {
                    removeModals();
                    //only for iOS.Because iOS Keyboard hides the input in the popup
                    if (window.cordova && window.cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.disableScroll(true);
                    }
                    $scope.callback();
                };

                $scope.setStartOn = function (value) {

                    if (value) {
                        $scope.start_on_display = date.getDateTime($scope.recurrencePicker.starts_on);
                        $scope.updateSummary();
                    }

                };

                $scope.setEndDate = function (value) {

                    if (value) {
                        $scope.end_display = date.getDateTime($scope.recurrencePicker.repeatEnd.end);
                        $scope.setRepeatEnd();
                    }
                };

                $scope.setRepeat = function (key) {
                    $scope.recurrencePicker.repeat = key;
                    $scope.updateSummary();
                    $scope.repeatModal.hide();
                };

                $scope.setRepeatEvery = function (item) {

                    $scope.recurrencePicker.every = item;
                    $scope.updateSummary();
                    $scope.repeatEveryModal.hide();
                };

                $scope.setRepeatBy = function () {

                    if($scope.recurrencePicker.repeatBy){

                        var startDateOfMonth = new Date();

                        startDateOfMonth.setDate(1);
                        for (var i = 0; i < 7; i++) {

                            if(startDateOfMonth.getDay() == $scope.recurrencePicker.starts_on.getDay()) break;
                            startDateOfMonth.setDate(startDateOfMonth.getDate()+1);
                        }
                        $scope.recurrencePicker.weekNumber = ($scope.recurrencePicker.starts_on.getDate() - startDateOfMonth.getDate())/7;
                    }
                    $scope.updateSummary();
                };

                $scope.setRepeatEnd = function(){

                    switch($scope.recurrencePicker.repeatEnd.id){

                        case 0:
                            $scope.recurrencePicker.repeatEnd = {
                                id: 0,
                                end: null,
                                occurrence: null,
                                remainingOccurrence: null
                            };
                            break;
                        case 1:
                            $scope.recurrencePicker.repeatEnd = {
                                id: 1,
                                end: null,
                                occurrence: $scope.recurrencePicker.repeatEnd.occurrence,
                                remainingOccurrence: $scope.recurrencePicker.repeatEnd.occurrence
                            };
                            break;
                        case 2:
                            $scope.recurrencePicker.repeatEnd = {
                                id: 2,
                                end: $scope.recurrencePicker.repeatEnd.end,
                                occurrence: null,
                                remainingOccurrence: null

                            };
                            break;

                    }
                    console.log($scope.recurrencePicker.repeatEnd);
                    $scope.updateSummary();
                };

                $scope.updateSummary = function () {

                    $scope.summary = dueService.getSummary($scope.recurrencePicker);
                    if($scope.recurrencePicker.repeatEnd && $scope.recurrencePicker.repeatEnd.end){
                        $scope.end_display = date.getDateTime($scope.recurrencePicker.repeatEnd.end);
                    }


                };



            }


        };
    }]);
}).call(this);
