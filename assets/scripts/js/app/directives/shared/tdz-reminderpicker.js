(function () {
    app.directive('tdzReminderpicker', ['$timeout', '$ionicModal', 'settingsService','userModel', 'date',
                                        'guidGenerator', 'reminderService', 'message','$q','dbEnums','roleValidators',
                            function ($timeout, $ionicModal, settingsService, userModel, date,
                                      guidGenerator, reminderService, message,$q,dbEnums,roleValidators) {
        return {
            require: 'ngModel',
            scope: {
                'ngModel': '=',
                'assignees': '=',
                'dueDate': '=',
                'callback': '&',
                'isEmailEnabled':'=',
                'defaultReminderChannels':'='
            },

            link: function ($scope, $element, attrs) {

                var EMPTY_OBJECT = {};
                var TIME_LIMIT =  -120000;// 2 minutes in miliseconds;
                var scheduleTime = null;

                var settings = settingsService.getSettings();
                var loggedInUser = userModel.getLoggedInUser();



                function createModals(){

                    $ionicModal.fromTemplateUrl('html/directives/shared/tdz-reminderpicker/reminder.html', function ($ionicModal) {
                        $scope.modal = $ionicModal;
                        $scope.modal.show();
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });

                    $ionicModal.fromTemplateUrl('html/directives/shared/tdz-reminderpicker/assignees.html', function ($ionicModal) {
                        $scope.userModal = $ionicModal;

                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });
                    $ionicModal.fromTemplateUrl('html/directives/shared/tdz-reminderpicker/notification-channels.html', function ($ionicModal) {
                        $scope.notificationChannelModal = $ionicModal;

                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });

                    $ionicModal.fromTemplateUrl('html/directives/shared/tdz-reminderpicker/reminder-time.html', function ($ionicModal) {
                        $scope.reminderTimeModal = $ionicModal;

                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });
                }

                function init(){

                    $scope.reminder = $scope.ngModel|| EMPTY_OBJECT;
                    $scope.noDueDate = !$scope.dueDate;
                    $scope.isDifferentUser = false;
                    $scope.valid = true;
                    $scope.notificationChannels = angular.copy($scope.defaultReminderChannels|| reminderService.notificationChannels);
                    if(!$scope.isEmailEnabled){
                        $scope.notificationChannels.email.value=false;
                        $scope.notificationChannels.email.notified=true;
                        $scope.notificationChannels.push.value=true;
                        $scope.notificationChannels.push.notified=false;
                    }
                    $scope.reminderTime = reminderService.timeDuration;

                    $scope.reminder.assignee = loggedInUser;
                    $scope.reminder.notificationChannels = angular.copy($scope.notificationChannels);

                    $scope.users = angular.copy($scope.assignees);
                    $scope.users.splice(0,1);
                    if(!$scope.users.length){
                        $scope.users.push(userModel.getLoggedInUser());
                    }
                }

                function setDateTime(){
                    $scope.reminder.dateTime = new Date();
                    var defaultDt = new Date(settings.reminder.defaultTime);
                    $scope.reminder.dateTime.setHours(defaultDt.getHours());
                    $scope.reminder.dateTime.setMinutes(defaultDt.getMinutes());
                }

                function validateRemindTime(){
                    var now = moment(new Date());

                    $scope.valid = !!$scope.reminder.time;
                    $scope.validationError = message.errorMessages.REMINDER_TIME_REQUIRED;
                    if($scope.valid && $scope.reminder.time.id == 1 && now.diff($scope.reminder.time.value)> TIME_LIMIT){
                        $scope.valid = false;
                        $scope.validationError = message.errorMessages.REMINDER_TIME_VALIDATION_ERROR_FOR_FIXED;
                    }

                    else if($scope.valid && $scope.reminder.time.id == 0){

                        var scheduleTime = reminderService.getScheduledTime($scope.reminder, $scope.dueDate);
                        if(!date.isAfter(scheduleTime, now)){
                            $scope.valid = false;
                            $scope.validationError = message.errorMessages.REMINDER_TIME_VALIDATION_ERROR_FOR_RELATIVE;
                        }
                    }
                }

                $element.on('click', function () {

                    init();
                    createModals();
                    setDateTime();
                });

                $scope.addChannels = function(){
                    if($scope.notificationChannels.email.value || $scope.notificationChannels.push.value){
                        $scope.reminder.notificationChannels = angular.copy($scope.notificationChannels);
                        $scope.notificationChannelModal.hide();
                    }

                };

                $scope.channelClicked = function (item) {
                    var asyncTask=$q(function(resolve,reject){
                        if(item.title=='Email' && item.value==false){
                            var user=userModel.getLoggedInUser();
                            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.EMAIL_NOTIFICATIONS,{},true)
                                .then(resolve,reject);
                            //reject();
                        }
                        else{
                            resolve();
                        }
                    });

                    asyncTask.then(function(){
                        item.value = !item.value;
                        item.notified = !item.value;
                    });


                    //item.value = !item.value;
                    //item.notified = !item.value;
                };

                $scope.openNotificationChannelModal = function(){
                    $scope.notificationChannels  =  angular.copy($scope.reminder.notificationChannels);
                    $scope.notificationChannelModal.show();
                };

                $scope.updateAssignee = function(assignee){
                    $scope.reminder.assignee = assignee;
                    $scope.isDifferentUser = loggedInUser._id != assignee._id;
                };

                $scope.updateReminderDate = function(value){

                    if(value == 'CUSTOM_DATE'){
                        $scope.reminder.time.id = 1;
                        $scope.reminder.time.value = angular.copy($scope.reminder.dateTime) ;
                        $scope.reminder.time.title =date.getDateTime( $scope.reminder.time.value);
                        scheduleTime = angular.copy($scope.reminder.time);
                        setDateTime();
                        validateRemindTime();
                    }
                    else $scope.reminder.time = angular.copy(scheduleTime) ;
                };

                $scope.updateReminderTime = function(time){
                    if(time){
                        $scope.reminder.time = angular.copy(time);
                        $scope.reminder.time.id = 0;
                        scheduleTime = angular.copy($scope.reminder.time);
                        validateRemindTime();

                    }
                    else $scope.reminder.time = angular.copy(scheduleTime);
                    $scope.reminderTimeModal.hide();

                };

                $scope.save = function () {

                    validateRemindTime();

                    if($scope.valid){
                        $scope.reminder.id =  guidGenerator.getId();
                        $scope.reminder.updatedBy = userModel.getLoggedInUser();
                        $scope.reminder.date_created = new Date();
                        $scope.ngModel = $scope.reminder;
                        $timeout(function () {
                            $scope.modal.remove();
                            $scope.callback({newReminder: true});
                        });
                    }
                };

                $scope.close = function () {
                    $scope.modal.remove();
                    $scope.callback({newReminder: false});
                };

                $scope.$watch('reminder.time.id',function(value){
                    if(value == 0 || value == 1){
                        $scope.valid = true;
                    }

                });
            }
        };
    }]);
}).call(this);
