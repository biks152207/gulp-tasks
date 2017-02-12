(function () {
    app.controller('addTaskController', function ($q, $scope, $rootScope, $ionicModal, $ionicPopup, $timeout, $state,
                  taskService, dueService, stringService, headerService, guidGenerator, dbEnums, reminderService,
                  sharedData, project, user, labelService, date, message, userModel,roleValidators,settingsService,popupService) {

        var discarded = false;

        $scope.dropdowns = {
            watchers: false,
            labels: false,
            reminders: true
        } ;
        $scope.isEmailEnabled=false;
        $scope.defaultReminderChannels=null;

        function isWatcherExists(watcher){
            var checked = false;
            if($scope.taskObject.watchers){
                $scope.taskObject.watchers.forEach(function(object){
                    if(object.watcher._id === watcher._id) {
                        checked = object.checked;
                    }
                })
            }
            return checked;
        }

        function setTaskObject(){
            taskService.setTaskObject($scope.taskObject);
        }

        function clearTaskObject(){
            discarded = true;
            taskService.clearTaskObject();
        }

        function createModals(){

            $ionicModal.fromTemplateUrl('html/views/modals/tasks/projects.html', function ($ionicModal) {
                $scope.projectModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
            $ionicModal.fromTemplateUrl('html/views/modals/tasks/assignees.html', function ($ionicModal) {
                $scope.userModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
            $ionicModal.fromTemplateUrl('html/views/modals/tasks/priorities.html', function ($ionicModal) {
                $scope.priorityModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
            $ionicModal.fromTemplateUrl('html/views/modals/tasks/due_date.html', function ($ionicModal) {
                $scope.dueDateModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
        }

        function setProjects(){
            project.getAll().then(function(projects){
                if(projects) {
                    projects.splice(0, 0, sharedData.inbox);
                    $scope.projects = projects;
                }
            });
        }

        function setLabels(){

            var oldLabels=$scope.taskObject.labels||[];
            $scope.taskObject.labels=[];

            labelService.getAll().then(function(labels){
                if(labels){
                    labels.forEach(function (label){
                        var exists= _.find(oldLabels,function(lbl){
                           return label.id==lbl.label.id;
                        });

                        $scope.taskObject.labels.push({
                            checked :exists?exists.checked: false,
                            label : label
                        });
                    });
                }

            });
        }

        function setPriorities(){
            $scope.priorities = taskService.priorities;
            //Default is Priority 4
            $scope.taskObject.priority = 3;
        }

        function setReminderList(){
            var scheduleTime ;
            $scope.taskObject.reminders.forEach(function(reminder){
                reminder.date_created = new Date(reminder.date_created);
                scheduleTime = reminderService.getScheduledTime(reminder, $scope.taskObject.recurrence.due_date);
                reminder.invalid = date.isPast(scheduleTime) || ($scope.taskObject.recurrence.due_date && date.isAfter(scheduleTime, $scope.taskObject.recurrence.due_date));
                if(reminder.time.id == 1) reminder.time.title = date.getDateTime(reminder.time.value);

            });
        }


        $scope.toggleMenu = function (key) {

            $scope.dropdowns[key] = !$scope.dropdowns[key];
        };

        $scope.tabFocus = function (event) {
            if(event.keyCode == 9){

                if(event.target.tabIndex == 3){ // User Modal
                    $scope.userModal.show()
                }
                else if(event.target.tabIndex == 4){ // Watchers
                    $scope.toggleMenu("watchers");
                }
                else if(event.target.tabIndex == 5){ // Priority
                    $scope.priorityModal.show()
                }
                else if(event.target.tabIndex == 6){ // Labels
                    $scope.toggleMenu("labels");
                }
                else if(event.target.tabIndex == 7){ // Due Date Modal
                    $scope.dueDateModal.show()
                }
                else if(event.target.tabIndex == 8){ // Reminders
                    $scope.toggleMenu("reminders");
                }
            }
        }

        $scope.setAssignees = function(){
            var defer = $q.defer();
            $scope.assignees = [];

            if($scope.taskObject.project.id){
                project.findById($scope.taskObject.project.id).then(function(taskProject){
                    taskProject.users.forEach(function(assignee){
                     if(assignee.status === dbEnums.status.active) $scope.assignees.push(assignee);
                     });
                    $scope.assignees = userModel.meTopOnList($scope.assignees);
                    $scope.assignees.unshift({
                        _id: 0,
                        displayName: 'Unassigned'
                    });
                    defer.resolve($scope.assignees);
                })
            }
            else{
                $scope.assignees.push({
                    _id: 0,
                    displayName: 'Unassigned'
                });
                defer.resolve($scope.assignees);
            }

            return defer.promise;
        };

        $scope.setWatchers = function(updated){
            var watchers = [];

            if(!$scope.taskObject.watchers.length || updated ){
                if($scope.taskObject.project.id){

                    project.findById($scope.taskObject.project.id).then(function(taskProject){
                        taskProject.users.forEach(function (watcher){
                            if($scope.taskObject.assignee._id !== watcher._id && watcher.status === dbEnums.status.active){
                                watchers.push({
                                    checked : isWatcherExists(watcher),
                                    watcher : watcher
                                });
                            }

                        });
                        watchers = userModel.meTopOnList(watchers, 'watcher');
                        console.log(watchers);
                        $scope.taskObject.watchers = angular.copy(watchers);

                    });


                }
                else{
                    $scope.taskObject.watchers = angular.copy(watchers);
                }
            }

        };

        $scope.setReminders = function(isProjectChanged, isDueDateChanged){

            var reminders = [];
            if($scope.taskObject.reminders.length){
                if(isProjectChanged){

                    var assignees = angular.copy($scope.assignees);
                    assignees.splice(0, 1); //Remove Unassigned

                    $scope.taskObject.reminders.forEach(function(prevReminder){

                        if(assignees.length){
                            for(var i =0; i < assignees.length; i++ ){
                                if(prevReminder.assignee._id == assignees[i]._id){
                                    reminders.push(prevReminder);
                                    break;
                                }
                            }
                        }
                        else if(prevReminder.assignee._id == userModel.getLoggedInId()){ // Inbox
                            reminders.push(prevReminder);
                        }
                    });

                }
                else if(isDueDateChanged){
                    $scope.taskObject.reminders.forEach(function(prevReminder){
                        if(prevReminder.time.id || (!prevReminder.time.id && $scope.taskObject.recurrence.due_date)){
                            reminders.push(prevReminder);
                        }
                    });

                }
                $scope.taskObject.reminders = angular.copy(reminders);
                setReminderList();
            }


        };

        $scope.setDueDate = function(){

            $scope.taskObject.recurrence = {};
            $scope.taskObject.hasDueDate = true;
            $scope.dueDateSummary = stringService.EMPTY;
            $scope.setReminders(false, true);
        };



        $scope.updateProject = function (project,force) {
            var projectChanged = $scope.taskObject.project.id != project.id;
            if(projectChanged && !force){
                var user=userModel.getLoggedInUser();
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.ACTIVE_TASKS,{project:project},true)
                    .then(function(){
                        applyProject();
                    });
            }
            else{
                applyProject();
            }

            function applyProject(){
                $scope.taskObject.project = {
                    id: project.id,
                    name: project.name,
                    color: project.color
                };

                if(projectChanged || force) {
                    $scope.taskObject.assignee = {};
                    $scope.setAssignees().then(function(){
                        $scope.setReminders(true, false);
                    });
                    $scope.setWatchers(true);
                }
            }
        };

        $scope.updateAssignee = function (assignee) {

            $scope.taskObject.assignee = {
                _id: assignee._id,
                displayName: assignee.displayName,
                displayShortName: assignee.displayShortName,
                email: assignee.email,
                avatar: assignee.avatar
            };
            $scope.setWatchers(true);
            addRemoveAutoReminder($scope.taskObject);
        };

        function addRemoveAutoReminder(taskObject){
            var user=userModel.getLoggedInUser();
            if(taskObject.recurrence && taskObject.recurrence.due_date && taskObject.assignee && taskObject.assignee._id==user._id){
                var autoReminder=taskService.addAutoReminder(taskObject.recurrence.due_date);
                if(autoReminder){
                    var existingAutoReminder= _.find(taskObject.reminders,function(reminder){
                        return reminder.auto;
                    });
                    if(!existingAutoReminder){

                        taskObject.reminders.push(autoReminder);
                        $scope.dropdowns.reminders = true;
                        setReminderList();
                    }
                }

            }
            else{
                _.remove(taskObject.reminders,function(reminder){
                    return reminder.auto;
                });

            }


        }

        $scope.updatePriority = function (key) {

           $scope.taskObject.priority = key;

        };

        $scope.updateDueDate = function(key){
            switch(key){
                case  "TODAY":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.today())
                    };
                    break;
                case  "TOMORROW":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.tomorrow())
                    };

                    break;
                case  "WEEK":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.nextWeek())
                    };
                    break;
                case  "MONTH":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.nextMonth())
                    };
                    break;
                case "NO_DATE":
                    $scope.dueDateModal.show();
                    break;
                case "CUSTOM_DATE":
                    $scope.taskObject.recurrence = {
                        due_date : $scope.taskObject.recurrence.due_date // clearing other recurrence props set during recurrence
                    };
                    break;

            }

            $scope.taskObject.hasDueDate = true;
            $scope.dueDateSummary = dueService.getSummary($scope.taskObject.recurrence);
            addRemoveAutoReminder($scope.taskObject);
            $scope.setReminders(false, true);
        };

        $scope.addReminder = function(newReminder){

            if(newReminder){
                $scope.taskObject.reminders.push($scope.reminderObject);
                $scope.dropdowns.reminders = true;
                setReminderList();
            }
            $scope.reminderObject = {};
        };

        $scope.removeReminder = function (id) {
            var infoMsg = message.infoMessages.REMINDER_DELETE_CONFIRMATION;
            $ionicPopup.show({
                title: infoMsg.title,
                template: infoMsg.message,
                scope: $scope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            for(var i=0; i < $scope.taskObject.reminders.length; i++){
                                if($scope.taskObject.reminders[i].id == id){
                                    $scope.taskObject.reminders.splice(i, 1);
                                    break;
                                }
                            }
                            setReminderList();
                        }
                    }]
            });

        };

        $scope.getRecurrenceModel = function (model) {

            if (model){
                $scope.taskObject.recurrence = model;
                $scope.taskObject.hasDueDate = true;
                $scope.taskObject.recurrence = dueService.setDueDate($scope.taskObject.recurrence);
                $scope.dueDateSummary = dueService.getSummary($scope.taskObject.recurrence);
                $scope.setReminders(false, true);
            }
            else {
                $timeout(function(){
                    $scope.dueDateModal.show();
                });
            }

        };


        $scope.saveKeyEnter = function(event){
            if(event.keyCode == 13){
                $scope.save();
            }
        }

        $scope.save = function () {

            $scope.form.$submitted = true;
            if($scope.form.$valid){

                taskService.add($scope.taskObject).then(function(results){

                    if(results){
                        clearTaskObject();
                        $rootScope.$emit('toast-message', message.successMessages.TASK_SAVED);
                        sharedData.taskHome($scope.taskObject);
                    }
                });

            }

        };

        $scope.discardPopup = function (toState, toParams) {
            popupService.discard($rootScope)
                .then(function(result){
                    if(result){
                        clearTaskObject();
                        $state.go(toState.name, toParams);
                    }
                    else{
                        return true;
                    }
                });

        };

        $scope.start = function () {

            $scope.taskObject =  taskService.getTaskObject();
            var user=userModel.getLoggedInUser();

            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.EMAIL_NOTIFICATIONS,{},false)
                .then(function(){
                    $scope.isEmailEnabled=true;
                });

            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.ACTIVE_TASKS,{project:$scope.taskObject.project},$scope.taskObject.project.id!=0)
                .then(null,function(){

                })
                .finally(function(){
                    var settings=settingsService.getSettings();
                    $scope.defaultReminderChannels=settings.reminder.taskCreateReminderNotificationChannels;
                    $scope.reminderObject = {};
                    $scope.title = 'Add Task';
                    $rootScope.addUrl = '#/task/add';
                    $rootScope.noteUrl = '#/task/note/';

                    setProjects();
                    $scope.setAssignees();
                    setLabels();
                    $scope.setWatchers();
                    setPriorities();

                    $scope.dueDateSummary = dueService.getSummary($scope.taskObject.recurrence);
                    $scope.loginId = userModel.getLoggedInId();
                    $scope.userId = userModel.getLoggedInId();

                    createModals();
                    headerService.setAddTaskHeader($scope);
                    $rootScope.$emit('task:header');

                    if($rootScope.taskSaved){
                        $timeout(function(){
                            $scope.save();
                            $rootScope.taskSaved = false;
                        });
                    }
                });


        };

        $scope.start();

        var stateChangeStartListener=$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {



            if($scope.taskObject){
                setTaskObject($scope.taskObject);
                if(toState.name !== '/task/note'){
                    if(!discarded && taskService.taskObjectHasValue()){
                        event.preventDefault();
                        $scope.discardPopup(toState, toParams);
                    }
                    else {
                        clearTaskObject();
                        clearModals();
                    }
                }
                else{
                    clearModals();
                }
            }


        });

        function clearModals(){
            if( $scope.projectModal)     $scope.projectModal.remove();
            if( $scope.userModal)        $scope.userModal.remove();
            if( $scope.priorityModal)    $scope.priorityModal.remove();
            if( $scope.dueDateModal)   $scope.dueDateModal.remove();
        }

        $scope.$on('$destroy', function(){

            projectListListener();
            stateChangeStartListener();

        });

        var projectListListener=$rootScope.$on('projectList-update',function() {

            if ($scope.taskObject.project.id) {

                project.findById($scope.taskObject.project.id).then(function (taskProject) {
                    if (taskProject) {
                        $scope.updateProject(taskProject, true);
                    }
                });
            }
        });


    });


}).call(this);
